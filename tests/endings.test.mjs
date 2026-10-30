import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {boot,collected} from './helpers/game.mjs';
const paths=JSON.parse(await readFile(new URL('./ending-paths.json',import.meta.url),'utf8'));
function prepared(path){
 let b=collected();
 if(path.includes('N01.call'))b.click({command:'call-chen'});
 // collected() has reached departure; update its checkpoint when choosing route.
 b.click({route:path.includes('N02.stranger')?'stranger':'chen'});b.code('2317');
 b.click({recipient:path.includes('N03.courier')?'courier':'chen'});b.click({command:'start-morning'});
 if(path.includes('N04.now'))b.click({morningQuestion:'station'});
 b.click({command:'visit-counter'});b.record('cabinetLog');b.record('counterNote');
 b.click({videoChoice:path.includes('N05.video')?'view':'skip'});
 b.counter('stored',['cabinetLog','counterNote'],'custody-gap');
 assert.match(b.view(),/data-command="start-story"/);
 b.click({command:'start-story'});assert.equal(b.state().stage,'story');return b;
}
function choose(b,node,choice){
 const r=b.storyRules;
 assert.equal(r.model.nodes[b.state().story.index].id,node);
 b.click({storyPane:'decision'});
 assert.match(b.view(),new RegExp('data-story-choice="'+choice+'"'));
 b.click({storyChoice:choice});assert.equal(b.state().story.pending,choice);
 const before=b.state().story.facts;
 const challenge=r.challenge(node,choice);
 if(challenge){
  assert.match(b.view(),/data-story-view="source"/);
  b.click({storyPane:'check'});
  assert.match(b.view(),/id="story-proof-form"/);
  b.proof('invalid');assert.deepEqual(b.state().story.facts,before);
  assert.match(b.text('story-proof-error'),/超出/);b.proof(challenge);
 }else b.click({storyCommand:'confirm'});
 assert.equal(b.state().story.pending,null);
}
for(const [id,path] of Object.entries(paths))test('actual app events reach '+id+' and restore its unique ending',()=>{
 let b=prepared(path);
 for(const step of path.slice(5)){
  const [node,choice]=step.split('.');
  choose(b,node,choice);
  b=boot(b.state()); // reload every confirmed scene, using production normalization
  b.tab('case');
 }
 assert.equal(b.state().story.ending,id);
 assert.match(b.view(),new RegExp('本轮结局|隐藏结局'));
 assert.ok(b.view().includes(b.storyRules.model.endings[id].title));
 assert.equal((b.view().match(/class="ending-id"/g)||[]).length,1);
 const ending=b.state().story.ending;
 b.click({storyPane:'relationship'});
 for(const relationship of ['continue','bounded','distance']){
  b.click({storyRelationship:relationship});assert.equal(b.state().story.ending,ending);
  const c=boot(b.state());assert.equal(c.state().story.relationship,relationship);
 }
});
test('exhaustive production rule traversal reaches every option and exactly the designed 18 endings',()=>{
 const b=prepared(paths.H01),r=b.storyRules,counts={},edges=new Set();let total=0;
 function walk(run){
  if(run.ending){counts[run.ending]=(counts[run.ending]||0)+1;total++;return;}
  const n=r.model.nodes[run.index];assert.ok(n);
  const opts=r.choices(run);assert.ok(opts.length);
  for(const o of opts){edges.add(n.id+'.'+o.id);const t=r.commit(run,o.id,r.challenge(n.id,o.id),r.requiredEvidence(n.id,o.id));assert.ok(t);walk(t);}
 }
 for(const early_call of [false,true])for(const address of ['chen','stranger'])for(const custody of ['chen','luo']){
  if(address==='chen'&&custody==='luo')continue;
  for(const asked of ['now','meeting'])for(const counter of ['records','scoped_video']){
   const run=r.begin(b.state());Object.assign(run.facts,{early_call,address,custody,asked,counter});walk(run);
  }
 }
 assert.equal(total,16408);assert.equal(Object.keys(counts).length,18);assert.equal(edges.size,40);
 assert.deepEqual(Object.keys(counts).sort(),Object.keys(paths).sort());
});
test('every reachable scene choice has substantive consequence prose and each material check has a quiz',()=>{
 const b=prepared(paths.H01),r=b.storyRules,c=b.storyContent;
 for(const n of r.model.nodes){
  assert.ok(c.nodes[n.id].intro.includes('<p>'),n.id);
  for(const o of n.options){const v=c.nodes[n.id].options[o.id];assert.ok(v.label&&v.note);assert.ok(v.result.includes('<p>')&&v.result.length>30,n.id+'.'+o.id);const q=r.challenge(n.id,o.id);if(q)assert.ok(c.quizzes[q]);}
 }
 const bodies=Object.values(c.endings);assert.equal(bodies.length,18);assert.equal(new Set(bodies).size,18);
 for(const text of [...bodies,...Object.values(c.nodes).map(n=>n.intro)])assert.equal(text.includes('\ufffd'),false);
});
test('a proposed action has no effect until its result is confirmed, and may be cancelled or reloaded',()=>{
 let b=prepared(paths.H01);b.click({storyPane:'decision'});b.click({storyChoice:'full'});
 const prior=b.state().story.facts;assert.equal(prior.participation,'unknown');
 b=boot(b.state());assert.equal(b.state().story.pending,'full');b.tab('case');
 b.click({storyCommand:'cancel'});assert.deepEqual(b.state().story.facts,prior);
 assert.equal(b.state().story.log.length,0);
});
test('forged facts, ending, impossible choices and missing proof cannot create future knowledge',()=>{
 const b=prepared(paths.H01),state=b.state();
 state.story.facts={scope:true,time:true,custody:'returned'};state.story.ending='H01';
 let c=boot(state);assert.equal(c.state().story.ending,null);assert.equal(c.state().story.facts.scope,false);
 state.story.log=[{node:'N17',choice:'close'}];c=boot(state);assert.equal(c.state().story.log.length,0);
 choose(b,'N06','full');const s=b.state();s.story.log.push({node:'N08',choice:'compare'});
 c=boot(s);assert.equal(c.state().story.log.length,1);assert.equal(c.state().story.facts.scope,false);
});
test('replay cancellation preserves all progress and confirmation restores the exact pre-choice state',()=>{
 let b=prepared(paths.H02);
 for(const step of paths.H02.slice(5)){const [n,c]=step.split('.');choose(b,n,c);}
 b.click({storyPane:'archive'});const before=b.state();b.click({storyReplay:'1'});assert.equal(b.dialog('story-replay-dialog'),true);
 b.press('cancel-story-replay');assert.deepEqual(b.state(),before);
 b.click({storyReplay:'1'});b.press('confirm-story-replay');
 assert.equal(b.state().story.ending,null);assert.equal(b.state().story.log.length,1);
 assert.equal(b.state().story.facts.custody,'luo');assert.equal(b.state().story.facts.scope,false);
 assert.equal(b.state().story.facts.corrected_claim,false);assert.equal(b.state().story.facts.custody_policy,'none');
 assert.equal(boot(b.state()).state().story.log.length,1);
});
test('scoped footage is optional for each hidden ending and early call order does not lock H01',()=>{
 for(const id of ['H01','H02'])for(const video of [false,true]){
  const path=paths[id].map(x=>x.startsWith('N05.')?'N05.'+(video?'video':'records'):x==='N01.call'?'N01.read':x);
  const b=prepared(path);for(const x of path.slice(5)){const [n,c]=x.split('.');choose(b,n,c);}
  assert.equal(b.state().story.ending,id);
 }
});
test('November formal reply never returns later scenes to October and original request grants no possession',()=>{
 const b=prepared(paths.H02);choose(b,'N06','full');choose(b,'N07','recover');
 assert.equal(b.state().story.facts.custody,'luo');choose(b,'N08','compare');choose(b,'N09','formal');
 assert.match(b.view(),/11月/);assert.equal(b.state().story.facts.delay,true);
 choose(b,'N09R','originals');assert.equal(b.state().story.facts.custody,'returned');assert.match(b.view(),/11月/);
});

test('every production option has an actual event path, including recovery and correction alternatives',()=>{
 const examples=new Map();
 for(const custody of ['safe','lost']){
  const path=custody==='safe'?paths.H01:paths.H02,b=prepared(path),r=b.storyRules;
  function visit(run,prefix){
   if(run.ending)return;
   const n=r.model.nodes[run.index];
   for(const o of r.choices(run)){
    const key=n.id+'.'+o.id,p=[...prefix,key];
    if(!examples.has(key))examples.set(key,{night:path,path:p});
    visit(r.commit(run,o.id,r.challenge(n.id,o.id),r.requiredEvidence(n.id,o.id)),p);
   }
  }
  visit(b.state().story,[]);
 }
 assert.equal(examples.size,40);
 for(const [key,e] of examples){
  const b=prepared(e.night);
  for(const step of e.path){const [n,c]=step.split('.');choose(b,n,c);}
  const restored=boot(b.state());assert.deepEqual(restored.state().story,b.state().story,key);
 }
});
test('reading earlier records preserves later progress, while confirmed night replay clears it',()=>{
 const b=prepared(paths.H02);for(const x of paths.H02.slice(5)){const [n,c]=x.split('.');choose(b,n,c);}
 const before=b.state().story;
 b.click({storyCommand:'review-start'});assert.equal(b.state().stage,'chapter2end');
 assert.doesNotMatch(b.view(),/data-command="review-counter"/);
 b.click({command:'start-story'});assert.deepEqual(b.state().story,before);
 b.click({storyPane:'archive'});assert.match(b.view(),/回看当时所见/);
 b.click({storyCommand:'review-start'});b.click({command:'request-night-replay'});b.press('confirm-replay');
 assert.equal(b.state().story,null);assert.equal(b.state().stage,'departure');assert.equal(b.state().morningStarted,false);
});

test('December site response has its own month after both voluntary and formal source routes',()=>{
 for(const timeChoice of ['voluntary','formal']){
  const b=prepared(paths.E16);
  for(const step of paths.E16.slice(5)){
   const [n,c]=step.split('.');
   if(n==='N17'){
    b.click({storyPane:'decision'});b.click({storyChoice:'site'});
    assert.match(b.view(),/12月 \/ 专业复核与整改/);
    assert.doesNotMatch(b.view(),/11月06日 \/ 资料核对/);break;
   }
   choose(b,n,n==='N09'?timeChoice:c);
  }
 }
});
test('formal contact response uses the actual October event date instead of calling it last night',()=>{
 const b=prepared(paths.E03);choose(b,'N06','trace');b.click({storyPane:'decision'});b.click({storyChoice:'formal'});
 assert.match(b.view(),/11月06日/);assert.match(b.view(),/10月25日晚/);assert.doesNotMatch(b.view(),/昨夜没有/);
});

test('closure interviews are optional, scoped and restore without granting a conclusion',()=>{
 let b=prepared(paths.H01);choose(b,'N06','full');choose(b,'N08','compare');
 b.click({interview:'fill'});assert.deepEqual(b.state().storyQuestions,[]);
 b.click({storyPane:'decision'});b.click({storyChoice:'voluntary'});const before=b.state().story;
 for(const interview of ['barrier','clock','fill','notebook'])b.click({interview});
 assert.equal(b.state().storyQuestions.length,4);assert.match(b.view(),/是我写的/);assert.deepEqual(b.state().story,before);
 b=boot(b.state());assert.equal(b.state().storyQuestions.length,4);
 b.click({storyPane:'check'});b.proof('backfill',[]);assert.equal(b.state().story.facts.time,false);
 b.proof('backfill',['register','photo']);assert.equal(b.state().story.facts.time,false);
 b.click({storyPane:'source'});b.click({storyPane:'check'});assert.match(b.view(),/value="register" checked/);
 b.proof('backfill',['han','sun']);assert.equal(b.state().story.facts.time,true);
 assert.deepEqual(b.state().story.log.at(-1).evidence,['han','sun']);assert.deepEqual(b.state().storyQuestions,[]);
});
test('formal closure sources use the same source check without pretending to conduct a new interview',()=>{
 const b=prepared(paths.H01);choose(b,'N06','full');choose(b,'N08','compare');
 b.click({storyPane:'decision'});b.click({storyChoice:'formal'});assert.doesNotMatch(b.view(),/data-interview=/);
 b.click({interview:'fill'});assert.deepEqual(b.state().storyQuestions,[]);
 b.click({storyPane:'check'});b.proof('backfill',['han','han']);assert.equal(b.state().story.facts.time,false);
 b.proof('backfill',['han','sun']);assert.equal(b.state().story.facts.time,true);assert.equal(b.state().story.facts.delay,true);
});
test('legacy confirmed conclusions migrate, while a new-format save missing its source check stops there',()=>{
 const b=prepared(paths.H01);for(const x of paths.H01.slice(5)){const [n,c]=x.split('.');choose(b,n,c);}
 const legacy=b.state();delete legacy.story.format;for(const x of legacy.story.log)delete x.evidence;
 assert.equal(boot(legacy).state().story.ending,'H01');
 const damaged=b.state();delete damaged.story.log.find(x=>x.node==='N09').evidence;
 const c=boot(damaged);assert.equal(c.state().story.ending,null);assert.equal(c.state().story.facts.time,false);
});

test('unrecognized save format cannot be treated as legacy proof of a closure conclusion',()=>{
 const b=prepared(paths.H01);for(const x of paths.H01.slice(5)){const [n,c]=x.split('.');choose(b,n,c);}
 for(const format of [2,'1',null]){
  const bad=b.state();bad.story.format=format;delete bad.story.log.find(x=>x.node==='N09').evidence;
  const c=boot(bad);assert.equal(c.state().story,null);assert.equal(c.state().stage,'chapter2end');
  assert.deepEqual(c.state().storyEvidence,[]);assert.deepEqual(c.state().storyQuestions,[]);
 }
});
test('cancel and confirmed replay clear current interview and source draft, cancellation of replay preserves them',()=>{
 const b=prepared(paths.H01);choose(b,'N06','full');choose(b,'N08','compare');
 b.click({storyPane:'decision'});b.click({storyChoice:'voluntary'});b.click({interview:'fill'});b.click({storyPane:'check'});b.proofDraft('backfill',['han','register']);
 b.click({storyPane:'archive'});const before=b.state();b.click({storyReplay:'1'});b.press('cancel-story-replay');assert.deepEqual(b.state(),before);
 b.click({storyReplay:'1'});b.press('confirm-story-replay');assert.deepEqual(b.state().storyEvidence,[]);assert.deepEqual(b.state().storyQuestions,[]);assert.equal(b.state().story.facts.time,false);
 const c=prepared(paths.H01);choose(c,'N06','full');choose(c,'N08','compare');c.click({storyPane:'decision'});c.click({storyChoice:'voluntary'});c.click({interview:'notebook'});c.click({storyPane:'check'});c.proofDraft('backfill',['han','sun']);c.click({storyCommand:'cancel'});
 assert.deepEqual(c.state().storyEvidence,[]);assert.deepEqual(c.state().storyQuestions,[]);assert.equal(c.state().story.pending,null);assert.equal(c.state().story.facts.time,false);
});

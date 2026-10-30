import test from 'node:test';
import assert from 'node:assert/strict';
import {boot,collected} from './helpers/game.mjs';
function meeting(){
 const b=collected();b.click({route:'chen'});b.code('2317');b.click({recipient:'chen'});
 b.click({command:'start-morning'});b.click({command:'visit-counter'});b.record('counterNote');
 b.counter('stored',['receipt','counterNote'],'custody-gap');b.click({command:'start-story'});return b;
}
function decide(b,choice){b.click({storyPane:'decision'});b.click({storyChoice:choice});}
function scope(){const b=meeting();decide(b,'full');b.click({storyCommand:'confirm'});decide(b,'compare');return b;}
test('scene, choice desk and notebook are separate windows and browsing never mutates story facts',()=>{
 const b=meeting(),before=b.state().story;
 assert.match(b.view(),/data-story-view="scene"/);assert.match(b.view(),/meeting-morning.webp/);
 assert.doesNotMatch(b.view(),/data-story-choice=/);
 for(const storyPane of ['decision','archive','scene']){
  b.click({storyPane});assert.match(b.view(),new RegExp('data-story-view="'+storyPane+'"'));
  assert.deepEqual(b.state().story,before);
 }
 b.click({storyPane:'decision'});assert.match(b.view(),/data-story-choice="full"/);
 assert.equal(boot(b.state()).state().storyView,'decision');
});
test('observed material opens separately from the proof task, and the answer survives returning to it',()=>{
 let b=scope();assert.match(b.view(),/data-story-view="source"/);assert.match(b.view(),/A-02范围图/);
 assert.doesNotMatch(b.view(),/id="story-proof-form"/);
 const before=b.state().story;b.proof('outside');assert.deepEqual(b.state().story,before);
 b.click({storyPane:'check'});assert.match(b.view(),/id="story-proof-form"/);assert.doesNotMatch(b.view(),/class="scope-map"/);
 b.proofDraft('address');b.click({storyPane:'source'});b.click({storyPane:'check'});
 assert.match(b.view(),/value="address" checked/);assert.equal(b.state().storyAnswer,'address');
 b=boot(b.state());assert.match(b.view(),/value="address" checked/);assert.equal(b.state().story.facts.scope,false);
 b.proof('outside');assert.equal(b.state().story.facts.scope,true);assert.equal(b.state().storyAnswer,'');assert.equal(b.state().storyView,'scene');
});
test('pending result is retained across notebook, phone records and reload',()=>{
 const b=scope(),before=b.state().story;
 b.click({storyPane:'archive'});assert.match(b.view(),/调查手记/);assert.doesNotMatch(b.view(),/id="story-proof-form"/);
 b.tab('notes');b.tab('case');assert.deepEqual(b.state().story,before);
 b.click({storyPane:'source'});assert.match(b.view(),/A-02范围图/);
 const c=boot(b.state());assert.equal(c.state().story.pending,'compare');assert.equal(c.state().storyView,'source');
});
test('illustration lightbox opens and closes without creating clues or changing the current window',()=>{
 const b=meeting(),before=b.state();b.click({sceneImage:'meeting-morning'});
 assert.equal(b.dialog('art-dialog'),true);assert.match(b.property('art-image','src'),/meeting-morning.webp$/);
 assert.match(b.property('art-image','alt'),/社区会面室/);b.press('close-art');assert.equal(b.dialog('art-dialog'),false);assert.deepEqual(b.state(),before);
 b.record('meeting-morning');assert.deepEqual(b.state().clues,before.clues);
 b.click({sceneImage:'unregistered'});assert.equal(b.dialog('art-dialog'),false);
});
test('unavailable panes cannot display future evidence or a premature ending',()=>{
 const b=meeting();for(const storyPane of ['source','check','ending','relationship','unknown'])b.click({storyPane});
 assert.equal(b.state().storyView,'scene');assert.doesNotMatch(b.view(),/A-02范围图|补录单一份|隐藏结局/);
 const bad=b.state();bad.storyView='check';bad.storyAnswer='outside';const restored=boot(bad);
 assert.equal(restored.state().storyAnswer,'');assert.match(restored.view(),/data-story-view="scene"/);
});
test('epilogue and relationship choice are separate windows with a stable ending',()=>{
 const b=meeting();decide(b,'leave');b.click({storyCommand:'confirm'});
 assert.match(b.view(),/本轮结局/);assert.doesNotMatch(b.view(),/data-story-relationship=/);
 const id=b.state().story.ending;b.click({storyPane:'relationship'});assert.match(b.view(),/data-story-relationship="bounded"/);
 b.click({storyRelationship:'bounded'});b.click({storyPane:'ending'});assert.equal(b.state().story.ending,id);
 assert.equal(boot(b.state()).state().story.relationship,'bounded');
});
test('previous candidate progress is copied into the new save without altering the old save',()=>{
 const old=scope().state();delete old.storyView;delete old.storyAnswer;
 const b=boot(undefined,old);assert.equal(b.state().story.pending,'compare');assert.equal(b.state().ending,'safe');
 assert.equal(b.state().storyView,'scene');assert.match(b.view(),/data-story-view="source"/);
 assert.deepEqual(JSON.parse(b.stored('after-hours-midnight-v05-rc1')),old);
 assert.match(b.text('toast'),/继续/);
});

test('night locations use their own artwork and opening them never grants a future location',()=>{
 const b=boot();assert.match(b.view(),/home-night.webp/);assert.doesNotMatch(b.view(),/factory-gate.webp|meeting-morning.webp/);
 b.click({sceneImage:'home-night'});assert.equal(b.dialog('art-dialog'),true);b.press('close-art');
 const c=collected();c.click({route:'chen'});assert.match(c.view(),/laundry-night.webp/);
 c.click({sceneImage:'laundry-night'});assert.match(c.property('art-image','src'),/laundry-night.webp/);c.press('close-art');
 assert.equal(c.state().lockerOpened,false);assert.equal(c.state().deduction,true);
});

test('the immediately previous visual candidate save is copied without overwriting it',()=>{
 const prior=scope().state(),key='after-hours-midnight-v06-rc1';
 const b=boot(undefined,prior,key);assert.equal(b.state().story.pending,'compare');assert.deepEqual(JSON.parse(b.stored(key)),prior);
});

test('the prior interview candidate source draft is copied with questions and source selection intact',()=>{
 const b=meeting();decide(b,'full');b.click({storyCommand:'confirm'});decide(b,'compare');b.click({storyPane:'check'});b.proof('outside');decide(b,'voluntary');b.click({interview:'fill'});b.click({storyPane:'check'});b.proofDraft('backfill',['han','photo']);
 const prior=b.state();delete prior.storyRecord;
 for(const key of ['after-hours-midnight-v07-rc1','after-hours-midnight-v07-rc2']){const c=boot(undefined,prior,key);assert.deepEqual(c.state().storyQuestions,['fill']);assert.deepEqual(c.state().storyEvidence,['han','photo']);assert.equal(c.state().story.facts.time,false);assert.equal(c.state().storyRecord,null);assert.deepEqual(JSON.parse(c.stored(key)),prior);}
});


test('notebook opens one past record while retaining the current unconfirmed source draft',()=>{
 let b=scope();b.click({storyPane:'check'});b.proof('outside');decide(b,'voluntary');b.click({storyPane:'check'});b.proofDraft('motive',['han','photo']);
 const before=b.state();b.click({storyPane:'archive'});
 assert.match(b.view(),/本项尚未确认/);assert.doesNotMatch(b.view(),/class="scope-map"|class="confirmed-conclusion"/);
 assert.doesNotMatch(b.view(),/data-story-record="2"/); // pending N09 is not a confirmed record
 b.click({storyRecord:'1'});assert.match(b.view(),/data-story-view="record"/);
 assert.match(b.view(),/A-02范围图/);assert.match(b.view(),/你确认的结论/);
 assert.match(b.view(),/A区实际边线不含S1/);assert.doesNotMatch(b.view(),/核对来源：韩|可以确定所有人预谋/);
 assert.deepEqual(b.state().story,before.story);assert.equal(b.state().storyAnswer,'motive');
 assert.deepEqual(b.state().storyEvidence,['han','photo']);
 b=boot(b.state());assert.match(b.view(),/data-story-view="record"/);
 b.click({storyRecord:'0'});assert.doesNotMatch(b.view(),/class="scope-map"|你确认的结论/);
 b.click({storyRecord:'1'});b.click({storyPane:'archive'});b.click({storyPane:'check'});
 assert.match(b.view(),/value="motive" checked/);assert.match(b.view(),/value="photo" checked/);assert.equal(b.state().story.facts.time,false);
});

test('record addresses cannot open unconfirmed or future material, including after save truncation',()=>{
 const b=scope();b.click({storyPane:'archive'});const before=b.state();
 for(const storyRecord of ['-1','1','2','0.5','999999999999999999999','invalid'])b.click({storyRecord});
 assert.deepEqual(b.state(),before);assert.doesNotMatch(b.view(),/data-story-view="record"/);
 for(const storyRecord of [-1,1,1.5,'0',null]){
  const bad={...before,storyView:'record',storyRecord},c=boot(bad);
  assert.equal(c.state().storyRecord,null);assert.doesNotMatch(c.view(),/data-story-view="record"/);
 }
 const bad={...before,storyView:'record',storyRecord:0,story:{...before.story,log:[]}};
 const c=boot(bad);assert.equal(c.state().storyRecord,null);assert.doesNotMatch(c.view(),/data-story-view="record"/);
});

test('confirmed voluntary and formal records retain their own dates, sources and conclusions',()=>{
 for(const choice of ['voluntary','formal']){
  const b=scope();b.click({storyPane:'check'});b.proof('outside');decide(b,choice);b.click({storyPane:'check'});b.proof('backfill',['sun','han']);
  b.click({storyPane:'archive'});b.click({storyRecord:'2'});
  assert.match(b.view(),choice==='formal'?/11月06日/:/10月27—28日/);
  assert.match(b.view(),/实际封闭与17:10补录分开/);
  assert.match(b.view(),/核对来源：孙原接收的17:10指令与本人说明；韩的实际封闭上报消息与本人说明/);
  assert.doesNotMatch(b.view(),/data-interview=|id="story-proof-form"/);
  b.click({storyRecord:'1'});assert.match(b.view(),/10月26日 14:30/);assert.doesNotMatch(b.view(),/11月06日|核对来源：孙/);
 }
});

test('record replay requires confirmation, and confirmed rewind invalidates the opened future record',()=>{
 const b=scope();b.click({storyPane:'check'});b.proof('outside');b.click({storyPane:'archive'});b.click({storyRecord:'1'});
 const before=b.state();b.click({storyReplay:'1'});b.press('cancel-story-replay');assert.deepEqual(b.state(),before);
 b.click({storyReplay:'1'});b.press('confirm-story-replay');assert.equal(b.state().storyRecord,null);
 assert.equal(b.state().story.facts.scope,false);assert.equal(b.state().story.log.length,1);
 b.click({storyPane:'archive'});b.click({storyRecord:'1'});assert.doesNotMatch(b.view(),/data-story-view="record"/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {boot,collected} from './helpers/game.mjs';

function night(recipient='chen'){
 const b=collected();b.click({route:recipient==='chen'?'chen':'stranger'});b.code('2317');b.click({recipient});
 assert.equal(b.state().stage,'ending');return b;
}
function morning(recipient='chen'){
 const b=night(recipient);b.click({command:'start-morning'});assert.equal(b.state().stage,'morning');return b;
}
function counter(recipient='chen'){
 const b=morning(recipient);b.click({command:'visit-counter'});assert.equal(b.state().stage,'counter');return b;
}
test('both night custody routes reach a normal 08:10 safety call before the counter puzzle',()=>{
 for(const recipient of ['chen','courier']){
  const b=morning(recipient);
  assert.match(b.view(),/08:10/);assert.match(b.view(),/何宁家。人没事/);
  assert.match(b.view(),recipient==='chen'?/单也签了/:/说没有叫过车/);
  assert.equal(b.state().ending,recipient==='chen'?'safe':'lost');
  assert.equal(boot(b.state()).state().stage,'morning');
 }
});
test('whereabouts and station questions are available immediately, optional, and survive reload',()=>{
 const b=morning();
 b.click({morningQuestion:'station'});assert.match(b.view(),/我提前设的。昨晚没去北站/);
 b.click({morningQuestion:'where'});assert.match(b.view(),/她有些单子/);
 b.click({morningQuestion:'station'});assert.equal(b.state().morningQuestions.length,2);
 const loaded=boot(b.state());assert.deepEqual(loaded.state().morningQuestions,['station','where']);
 loaded.click({command:'visit-counter'});assert.equal(loaded.state().stage,'counter');
 const skip=morning();skip.click({command:'visit-counter'});assert.deepEqual(skip.state().morningQuestions,[]);
});
test('first-act replay after morning is labelled historical and does not invent a new metro call',()=>{
 const b=morning();b.tab('messages');assert.match(b.view(),/次日08:10来电报平安/);
 assert.match(b.view(),/昨夜通话/);assert.doesNotMatch(b.view(),/data-command="call-chen"/);
});
test('counter evidence is inaccessible before visiting, and footage additionally needs scope consent',()=>{
 const b=boot();b.record('cabinetLog');assert.equal(b.state().clues.includes('cabinetLog'),false);
 const c=counter();c.record('camera');assert.equal(c.state().clues.includes('camera'),false);
 c.record('cabinetLog');assert.match(c.details(),/同一笔业务/);
 c.click({videoChoice:'view'});c.record('camera');assert.match(c.details(),/没有复制视频/);
 assert.equal(c.state().clues.includes('camera'),true);
});
test('same-business copies and overclaiming a full custody chain cannot solve reconstruction',()=>{
 const b=counter();b.record('cabinetLog');b.record('counterNote');
 b.counter('stored',['receipt','cabinetLog'],'custody-gap');assert.equal(b.state().stage,'counter');
 assert.match(b.text('counter-error'),/同源记录/);
 b.counter('arrival',['receipt','counterNote'],'custody-gap');assert.equal(b.state().stage,'counter');
 b.counter('stored',['receipt','counterNote'],'safety');assert.equal(b.state().stage,'counter');
 b.counter('stored',['receipt','counterNote'],'custody-gap');assert.equal(b.state().stage,'chapter2end');
 assert.match(b.view(),/未连续|连续影像/);
});
test('counter can be completed without any camera permission or viewing',()=>{
 const b=counter();b.click({videoChoice:'skip'});b.record('cabinetLog');b.record('counterNote');
 b.counter('stored',['cabinetLog','counterNote'],'custody-gap');
 assert.equal(b.state().stage,'chapter2end');assert.equal(b.state().videoChoice,'skip');
 assert.match(b.view(),/依据本单业务记录、暂存简记和孟雪的说明/);
 assert.doesNotMatch(b.view(),/你在笔记旁写下：看过两段/);
 assert.equal(boot(b.state()).state().stage,'chapter2end');
});
test('several valid source pairs work; choosing an unrecorded clip does not',()=>{
 for(const pair of [['receipt','counterNote'],['cabinetLog','counterNote'],['receipt','camera'],['cabinetLog','camera']]){
  const b=counter();b.record('cabinetLog');b.record('counterNote');
  b.counter('stored',pair,'custody-gap');
  if(pair.includes('camera')){assert.equal(b.state().stage,'counter');b.click({videoChoice:'view'});b.record('camera');b.counter('stored',pair,'custody-gap');}
  assert.equal(b.state().stage,'chapter2end');
 }
});
test('lost branch keeps the missing signature and never gains an original from shop testimony',()=>{
 const b=counter('courier');b.record('counterNote');
 b.counter('stored',['receipt','counterNote'],'custody-gap');
 assert.equal(b.state().ending,'lost');assert.match(b.view(),/没有那张签收单/);
 assert.doesNotMatch(b.view(),/原页已经交给陈默/);
 const loaded=boot(b.state());assert.equal(loaded.state().ending,'lost');assert.equal(loaded.state().stage,'chapter2end');
});
test('forged later-stage saves lose inaccessible evidence and return to the earliest valid scene',()=>{
 const b=boot({stage:'chapter2end',morningStarted:true,counterVisited:true,clues:['camera','counterNote'],counterConclusion:{event:'stored',evidence:['receipt','camera'],limit:'custody-gap'}});
 assert.equal(b.state().stage,'investigate');assert.deepEqual(b.state().clues,[]);
 const good=counter().state();
 const noVisit=boot({...good,counterVisited:false,stage:'chapter2end'});assert.equal(noVisit.state().stage,'morning');
 const noProof=boot({...good,stage:'chapter2end',clues:[...good.clues,'camera'],videoChoice:'skip',counterConclusion:{event:'stored',evidence:['receipt','camera'],limit:'custody-gap'}});
 assert.equal(noProof.state().stage,'counter');assert.equal(noProof.state().clues.includes('camera'),false);
});
test('returning to a night choice clears second-act knowledge but reset cancellation preserves it',()=>{
 const b=counter();b.record('counterNote');b.press('reset');b.press('cancel-reset');
 assert.equal(b.state().stage,'counter');assert.ok(b.state().clues.includes('counterNote'));
 b.click({command:'reconsider'});assert.equal(b.state().morningStarted,false);assert.deepEqual(b.state().morningQuestions,[]);
 assert.equal(b.state().counterVisited,false);assert.equal(b.state().clues.includes('counterNote'),false);
});
test('revisiting the phone preserves asked questions and does not alter custody or conclusion',()=>{
 const b=morning('courier');b.click({morningQuestion:'silence'});b.click({command:'visit-counter'});b.record('counterNote');
 b.counter('stored',['receipt','counterNote'],'custody-gap');
 const conclusion=b.state().counterConclusion;b.click({command:'replay-morning'});
 assert.deepEqual(b.state().morningQuestions,['silence']);assert.equal(b.state().ending,'lost');
 b.click({command:'visit-counter'});assert.deepEqual(b.state().counterConclusion,conclusion);
});

test('reviewing evidence returns to the stored counter result without solving it again',()=>{
 const b=counter();b.record('counterNote');b.counter('stored',['receipt','counterNote'],'custody-gap');
 const stored=b.state().counterConclusion;b.click({command:'review-counter'});
 assert.match(b.view(),/返回已保存的核对结果/);
 b.record('receipt');b.click({command:'return-counter-result'});
 assert.equal(b.state().stage,'chapter2end');assert.deepEqual(b.state().counterConclusion,stored);
});

test('visible second-act replay entry preserves every saved field when cancelled',()=>{
 for(const recipient of ['chen','courier']){
  const b=counter(recipient);b.record('counterNote');b.counter('stored',['receipt','counterNote'],'custody-gap');
  assert.match(b.view(),/data-command="request-night-replay"/);
  const saved=b.state();b.click({command:'request-night-replay'});
  assert.equal(b.dialog('replay-dialog'),true);assert.deepEqual(b.state(),saved);
  b.press('cancel-replay');assert.equal(b.dialog('replay-dialog'),false);assert.deepEqual(b.state(),saved);
  b.press('confirm-replay');assert.deepEqual(b.state(),saved);
 }
});
test('confirmed replay after reload clears next-day work and restores contact before departure',()=>{
 const b=counter();b.record('counterNote');b.counter('stored',['receipt','counterNote'],'custody-gap');
 assert.equal(b.state().contactVerified,true);
 const loaded=boot(b.state());loaded.click({command:'request-night-replay'});loaded.press('confirm-replay');
 assert.equal(loaded.state().stage,'departure');assert.equal(loaded.state().contactVerified,false);
 assert.equal(loaded.state().ending,null);assert.equal(loaded.state().counterConclusion,null);
 assert.equal(loaded.state().morningStarted,false);assert.equal(loaded.state().counterVisited,false);
 assert.equal(loaded.state().videoChoice,null);assert.deepEqual(loaded.state().morningQuestions,[]);
 assert.equal(loaded.state().clues.includes('counterNote'),false);
 loaded.click({route:'stranger'});loaded.code('2317');loaded.click({recipient:'courier'});
 assert.equal(loaded.state().handoffKnowledge,'unverified');assert.match(loaded.view(),/哪个司机/);
});
test('replay retains a call actually made before departure and keeps later-acquired clues out',()=>{
 const b=boot();for(const id of ['scheduled','photo','receipt'])b.record(id);
 b.tab('case');b.deduce(['scheduled','photo']);b.click({location:'laundry'});b.click({command:'call-chen'});
 b.click({route:'stranger'});b.record('contact');b.code('2317');b.click({recipient:'courier'});
 assert.ok(b.state().clues.includes('contact'));b.click({command:'reconsider'});
 assert.equal(b.state().contactVerified,true);assert.equal(b.state().clues.includes('contact'),false);
 b.click({route:'stranger'});b.code('2317');b.click({recipient:'courier'});
 assert.equal(b.state().handoffKnowledge,'verified');assert.match(b.view(),/你没给他吧/);
});
test('invalid departure checkpoint cannot introduce invented evidence or future knowledge',()=>{
 const s=counter().state();
 const loaded=boot({...s,departureCheckpoint:{clues:['camera','counterNote','fake'],contactVerified:true,hints:{counter:3}}});
 assert.equal(loaded.state().departureCheckpoint,null);
 loaded.click({command:'reconsider'});assert.equal(loaded.state().contactVerified,false);
 assert.deepEqual(loaded.state().clues,['scheduled','photo','receipt']);
 const noNight=boot();noNight.click({command:'reconsider'});assert.equal(noNight.state().stage,'investigate');
});

test('unfinished counter choices survive hints, material recording, tab review and reload',()=>{
 const b=counter();b.record('counterNote');b.draft('arrival',['receipt','counterNote'],'box');
 const draft=b.state().counterDraft;
 b.click({command:'hint'});b.record('cabinetLog');b.tab('album');b.tab('case');
 assert.deepEqual(b.state().counterDraft,draft);assert.equal(b.state().counterConclusion,null);
 const loaded=boot(b.state());assert.deepEqual(loaded.state().counterDraft,draft);
 assert.match(loaded.view(),/<option value="arrival" selected>/);
 assert.match(loaded.view(),/<option value="box" selected>/);
 assert.match(loaded.view(),/name="counter-evidence" value="counterNote" checked/);
 assert.doesNotMatch(loaded.view(),/<option value="stored" selected>/);
});
test('a correct-looking draft never becomes a conclusion without explicit submission',()=>{
 for(const recipient of ['chen','courier']){
  const b=counter(recipient);b.record('counterNote');b.draft('stored',['receipt','counterNote'],'custody-gap');
  const loaded=boot(b.state());assert.equal(loaded.state().stage,'counter');assert.equal(loaded.state().counterConclusion,null);
  assert.match(loaded.view(),/<option value="stored" selected>/);
  loaded.counter('stored',['receipt','counterNote'],'custody-gap');assert.equal(loaded.state().stage,'chapter2end');
 }
});
test('draft restoration filters unknown, unrecorded and unauthorized evidence without adding progress',()=>{
 const b=counter();const loaded=boot({...b.state(),counterDraft:{event:'<script>',limit:9,evidence:['receipt','receipt','camera','counterNote','promise','fake']}});
 assert.deepEqual(loaded.state().counterDraft,{event:'',evidence:['receipt'],limit:''});
 assert.equal(loaded.state().counterConclusion,null);
 const noVisit=boot({counterDraft:{event:'stored',evidence:['receipt'],limit:'custody-gap'}});
 assert.deepEqual(noVisit.state().counterDraft,{event:'',evidence:[],limit:''});
 const changed=boot({...b.state(),videoChoice:'skip',clues:[...b.state().clues,'camera'],counterDraft:{event:'stored',evidence:['receipt','camera'],limit:'custody-gap'}});
 assert.deepEqual(changed.state().counterDraft.evidence,['receipt']);
});
test('optional footage does not erase unrelated drafts or an already valid record-based conclusion',()=>{
 const b=counter();b.record('counterNote');b.counter('stored',['receipt','counterNote'],'custody-gap');
 const proof=b.state().counterConclusion;b.click({command:'review-counter'});b.draft('arrival',['receipt'],'box');
 const draft=b.state().counterDraft;b.click({videoChoice:'view'});b.record('camera');
 assert.deepEqual(b.state().counterDraft,draft);assert.deepEqual(b.state().counterConclusion,proof);
 b.click({command:'return-counter-result'});assert.equal(b.state().stage,'chapter2end');
});
test('reset and replay cancel preserve counter drafts; confirmed actions clear them',()=>{
 const b=counter();b.record('counterNote');b.draft('stored',['receipt','counterNote'],'custody-gap');
 b.press('reset');b.press('cancel-reset');assert.equal(b.state().counterDraft.event,'stored');
 b.counter('stored',['receipt','counterNote'],'custody-gap');b.click({command:'request-night-replay'});b.press('cancel-replay');
 assert.equal(b.state().counterDraft.event,'stored');
 b.click({command:'request-night-replay'});b.press('confirm-replay');assert.deepEqual(b.state().counterDraft,{event:'',evidence:[],limit:''});
 b.press('reset');b.press('confirm-reset');assert.deepEqual(b.state().counterDraft,{event:'',evidence:[],limit:''});
});

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
 const prior=b.state(),key='after-hours-midnight-v07-rc1',c=boot(undefined,prior,key);
 assert.deepEqual(c.state().storyQuestions,['fill']);assert.deepEqual(c.state().storyEvidence,['han','photo']);assert.equal(c.state().story.facts.time,false);assert.deepEqual(JSON.parse(c.stored(key)),prior);
});

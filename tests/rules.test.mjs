import test from 'node:test';
import assert from 'node:assert/strict';
import '../app/rules.js';
const R=globalThis.MidnightRules;

test('deduction requires both time provenance records and rejects irrelevant evidence',()=>{
 assert.equal(R.evaluateDeduction(['scheduled','photo']),true);
 assert.equal(R.evaluateDeduction(['photo','scheduled','photo']),true);
 assert.equal(R.evaluateDeduction(['scheduled']),false);
 assert.equal(R.evaluateDeduction(['scheduled','receipt']),false);
 assert.equal(R.evaluateDeduction(['scheduled','photo','receipt']),false);
});
test('locker cannot be reached by collecting clues alone',()=>{
 const s=R.initial();s.clues=['scheduled','photo','receipt'];
 assert.equal(R.canVisitLocker(s),false);s.deduction=true;
 assert.equal(R.canVisitLocker(s),true);s.clues=['scheduled','photo'];
 assert.equal(R.canVisitLocker(s),false);
});
test('code check rejects coercion and partially matching values',()=>{
 assert.equal(R.validCode('2317'),true);
 for(const x of [2317,'2317 ','02317','0000','2317x',''])assert.equal(R.validCode(x),false);
});
test('save normalization rejects impossible advancement and unknown clues',()=>{
 assert.equal(R.normalize({stage:'handoff',deduction:true,clues:[]}).stage,'investigate');
 const good=R.normalize({stage:'ending',ending:'safe',deduction:true,clues:['scheduled','photo','receipt','receipt','fake'],hints:{locker:200}});
 assert.equal(good.stage,'ending');assert.equal(good.hints.locker,3);
 assert.deepEqual(good.clues,['scheduled','photo','receipt']);
 assert.equal(R.normalize({tab:'unknown'}).tab,'messages');
});
test('only the two explicit recipients map to endings',()=>{
 assert.equal(R.endingFor('chen'),'safe');assert.equal(R.endingFor('courier'),'lost');
 assert.equal(R.endingFor('unknown'),null);
});

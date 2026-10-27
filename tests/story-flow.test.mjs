
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const script=(await readFile(new URL('../app/rules.js',import.meta.url),'utf8'))+'\n'+
 await readFile(new URL('../app/app.js',import.meta.url),'utf8');
const KEY='after-hours-midnight-v03-rc1';
function boot(saved){
 const storage=new Map(saved?[[KEY,JSON.stringify(saved)]]:[]);
 const elements=new Map();
 const element=selector=>{
  if(!elements.has(selector))elements.set(selector,{listeners:{},innerHTML:'',textContent:'',value:'',scrollTop:0,classList:{toggle(){},add(){},remove(){}},addEventListener(type,fn){this.listeners[type]=fn;},setAttribute(){},showModal(){this.open=true;},close(){this.open=false;}});
  return elements.get(selector);
 };
 const tabs=['messages','album','notes','case'].map(tab=>({...element('tab:'+tab),dataset:{tab}}));
 let checked=[];
 element('#screen').querySelectorAll=()=>checked.map(value=>({value}));
 const context={document:{querySelector:element,querySelectorAll:selector=>{assert.equal(selector,'[data-tab]');return tabs;}},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},setTimeout:()=>1,clearTimeout(){}};
 vm.createContext(context);
 vm.runInContext(script,context,{timeout:1000});
 const dispatch=(selector,type,target)=>element(selector).listeners[type]({target,preventDefault(){}});
 const button=dataset=>({dataset,closest(){return this;}});
 return {
  rules:context.MidnightRules,
  state:()=>JSON.parse(storage.get(KEY)),
  view:()=>element('#screen').innerHTML,
  tab:tab=>dispatch('.tabs','click',button({tab})),
  click:dataset=>dispatch('#screen','click',button(dataset)),
  press:id=>dispatch('#'+id,'click',button({})),
  record(id){this.click({clue:id});this.press('record');},
  deduce(values){checked=values;dispatch('#screen','submit',{id:'deduction-form'});},
  code(value){element('#locker-code').value=value;dispatch('#screen','submit',{id:'code-form'});},
  text:id=>element('#'+id).textContent,
  dialog:id=>element('#'+id).open
 };
}
function collected(){
 const b=boot();
 b.record('scheduled');
 b.tab('album');b.record('photo');b.record('receipt');
 b.tab('messages');b.record('promise');
 b.tab('notes');b.record('contact');
 b.tab('case');
 b.deduce(['scheduled','receipt']);
 assert.equal(b.state().deduction,false);
 b.deduce(['scheduled','photo']);
 assert.equal(b.state().deduction,true);
 b.click({location:'station'});assert.equal(b.state().stage,'investigate');
 b.click({location:'laundry'});assert.equal(b.state().stage,'departure');
 return b;
}
test('script compiles; evidence separates phone sources and avoids fictional scheduling logs',()=>{
 const b=boot();
 assert.match(b.view(),/工作号发给我/);
 assert.match(b.view(),/个人号短信/);
 assert.match(b.view(),/她把手机放下时交代过/);
 b.click({clue:'scheduled'});
 assert.match(b.text('inspect-title'),/本地发送/);
 assert.doesNotMatch(script,/19:02|任务建立|同步了刚才/);
 b.tab('album');assert.match(b.view(),/2024年5月16日/);

});
test('Chen can be contacted before solving; denial survives a reload',()=>{
 const b=boot();
 b.click({command:'call-chen'});
 assert.equal(b.state().contactVerified,true);
 const loaded=boot(b.state());
 assert.match(loaded.view(),/没托人拿/);
});
test('without location disclosure no courier appears or can receive the bag',()=>{
 const b=collected();
 b.click({route:'chen'});assert.equal(b.state().stage,'locker');
 b.code('0000');assert.equal(b.state().stage,'locker');
 b.code('2317');assert.equal(b.state().stage,'handoff');
 assert.doesNotMatch(b.view(),/data-recipient="courier"/);
 b.click({recipient:'courier'});assert.equal(b.state().stage,'handoff');
 b.click({recipient:'chen'});
 assert.equal(b.state().ending,'safe');
 assert.equal(b.state().contactVerified,true);
 assert.match(b.view(),/八张|数清八张/);
 assert.match(b.view(),/原页别折/);
 const loaded=boot(b.state());assert.equal(loaded.state().stage,'ending');
});
test('explicit disclosure precedes courier arrival and lost custody persists on reload',()=>{
 const b=collected();
 assert.match(b.view(),/回复陌生号码：青禾洗衣/);
 b.click({route:'stranger'});b.code('2317');
 assert.match(b.view(),/data-recipient="courier"/);
 b.click({recipient:'courier'});
 assert.equal(b.state().ending,'lost');
 assert.match(b.view(),/签过字的那张纸也在袋里/);
 assert.match(b.view(),/孟雪打印/);
 assert.match(b.view(),/十一分钟后/);
 assert.equal(boot(b.state()).state().ending,'lost');
 b.click({command:'reconsider'});
 assert.equal(b.state().stage,'departure');
 assert.equal(b.state().ending,null);
 assert.equal(b.state().departureRoute,null);
});
test('forged progress lacking disclosure or verified identity cannot restore an ending',()=>{
 const b=boot();
 const common={tab:'case',deduction:true,clues:['scheduled','photo','receipt'],stage:'ending',lockerOpened:true,handoffKnowledge:'verified'};
 assert.equal(b.rules.normalize({...common,ending:'lost'}).stage,'departure');
 assert.notEqual(b.rules.normalize({...common,ending:'lost',departureRoute:'chen'}).stage,'ending');
 assert.notEqual(b.rules.normalize({...common,ending:'safe',departureRoute:'chen'}).stage,'ending');
 assert.equal(b.rules.normalize({...common,ending:'safe',departureRoute:'chen',contactVerified:true}).stage,'ending');
 assert.equal(b.rules.validCode(2317),false);
});
test('hints clamp, reset cancellation preserves progress, confirmed reset starts only the preview save',()=>{
 const b=collected();
 for(let i=0;i<5;i++)b.click({command:'hint'});
 assert.equal(b.state().hints.departure,3);
 b.press('reset');assert.equal(b.dialog('reset-dialog'),true);
 b.press('cancel-reset');assert.equal(b.state().stage,'departure');
 b.press('reset');b.press('confirm-reset');
 assert.equal(b.state().stage,'investigate');
 assert.deepEqual(b.state().clues,[]);
 assert.equal(b.state().departureRoute,null);
});

test('calling Chen before delivery changes the dialogue and is preserved after reload',()=>{
 const b=collected();
 b.click({command:'call-chen'});
 b.click({route:'stranger'});b.code('2317');b.click({recipient:'courier'});
 assert.equal(b.state().handoffKnowledge,'verified');
 assert.match(b.view(),/你没给他吧/);
 assert.doesNotMatch(b.view(),/哪个司机/);
 assert.match(boot(b.state()).view(),/你没给他吧/);
});
test('calling Chen after delivery does not rewrite the earlier scene',()=>{
 const b=collected();
 b.click({route:'stranger'});b.code('2317');b.click({recipient:'courier'});
 b.tab('messages');b.click({command:'call-chen'});
 b.tab('case');b.click({command:'show-clues'});
 assert.match(b.view(),/回到本轮交接结果/);
 b.click({command:'return-ending'});
 assert.equal(b.state().handoffKnowledge,'unverified');
 assert.match(b.view(),/哪个司机/);
 assert.doesNotMatch(b.view(),/你没给他吧/);
});

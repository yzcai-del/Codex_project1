import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
export const script=(await Promise.all(['rules.js','chapter2.js','story-rules.js','story-content.js','story.js','app.js'].map(f=>readFile(new URL('../../app/'+f,import.meta.url),'utf8')))).join('\n');
const KEY='after-hours-midnight-v05-rc1';
export function boot(saved){
 const storage=new Map(saved?[[KEY,JSON.stringify(saved)]]:[]);
 const elements=new Map();
 const element=selector=>{
  if(!elements.has(selector))elements.set(selector,{listeners:{},dataset:{},innerHTML:'',textContent:'',value:'',scrollTop:0,classList:{toggle(){},add(){},remove(){}},addEventListener(type,fn){this.listeners[type]=fn;},setAttribute(){},showModal(){this.open=true;},close(){this.open=false;}});
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
  rules:context.MidnightRules,storyRules:context.MidnightStoryRules,storyContent:context.MidnightStoryContent,
  proof(value){checked=[value];dispatch('#screen','submit',{id:'story-proof-form'});},
  state:()=>JSON.parse(storage.get(KEY)),
  view:()=>element('#screen').innerHTML,
  tab:tab=>dispatch('.tabs','click',button({tab})),
  click:dataset=>dispatch('#screen','click',button(dataset)),
  press:id=>dispatch('#'+id,'click',button({})),
  record(id){this.click({clue:id});this.press('record');},
  deduce(values){checked=values;dispatch('#screen','submit',{id:'deduction-form'});},
  code(value){element('#locker-code').value=value;dispatch('#screen','submit',{id:'code-form'});},
  draft(event,evidence,limit){element('#counter-event').value=event;element('#counter-limit').value=limit;checked=evidence;dispatch('#screen','change',{closest:selector=>selector==='#counter-form'?{id:'counter-form'}:null});},
  counter(event,evidence,limit){element('#counter-event').value=event;element('#counter-limit').value=limit;checked=evidence;dispatch('#screen','submit',{id:'counter-form'});},
  details:()=>element('#inspect-content').innerHTML,
  text:id=>element('#'+id).textContent,
  dialog:id=>element('#'+id).open
 };
}
export function collected(){
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

// Implemented choice rules. No author notes or future chapters are bundled.
(function(root){
 'use strict';
 const model={"initial":{"early_call":false,"address":"chen","custody":"chen","asked":"now","counter":"records","participation":"unknown","custody_policy":"none","scope":false,"time":false,"time_source":"none","delay":false,"permission":"minimum","disclosure":"private","corrected_claim":false,"privacy_repaired":false,"misdelivery_reported":false,"own_statement":"truthful","ownership":"unconfirmed","followup":"none","cost_requested":false,"trace_proven":false},"nodes":[{"id":"N06","when":null,"options":[{"id":"leave","set":{},"end":"E01","requires":null},{"id":"witness","set":{},"end":"E02","requires":null},{"id":"trace","set":{"participation":"trace"},"end":null,"requires":null},{"id":"full","set":{"participation":"full"},"end":null,"requires":null}]},{"id":"N06T","when":{"field":"participation","eq":"trace"},"options":[{"id":"scoped","set":{"trace_proven":true},"end":"E03","requires":null},{"id":"formal","set":{"trace_proven":true,"delay":true},"end":"E03","requires":null}]},{"id":"N07","when":{"field":"custody","eq":"luo"},"options":[{"id":"recover","set":{"custody_policy":"requested","misdelivery_reported":true},"end":null,"requires":null},{"id":"defer","set":{"custody_policy":"defer"},"end":"E05","requires":null},{"id":"deal","set":{"custody":"returned","custody_policy":"deal"},"end":"E09","requires":null}]},{"id":"N08","when":null,"options":[{"id":"compare","set":{"scope":true},"end":null,"requires":null},{"id":"limited","set":{"scope":false},"end":null,"requires":null}]},{"id":"N09","when":null,"options":[{"id":"voluntary","set":{"time":true,"time_source":"voluntary"},"end":null,"requires":null},{"id":"formal","set":{"time":true,"time_source":"formal","delay":true},"end":null,"requires":null},{"id":"limited","set":{"time":false,"time_source":"limited"},"end":null,"requires":null}]},{"id":"N09R","when":{"field":"custody_policy","eq":"requested"},"options":[{"id":"originals","set":{"custody":"returned","custody_policy":"recovered"},"end":null,"requires":null},{"id":"copies","set":{"custody_policy":"defer"},"end":"E05","requires":null}]},{"id":"N10","when":null,"options":[{"id":"scope_only","set":{},"end":"E04","requires":{"field":"scope","eq":true}},{"id":"time_only","set":{},"end":"E07","requires":{"field":"time","eq":true}},{"id":"gaps","set":{},"end":"LIMITED","requires":{"not":{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]}}},{"id":"complete","set":{"scope":true,"time":true,"delay":true},"end":null,"requires":{"not":{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]}}},{"id":"continue","set":{},"end":null,"requires":{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]}}]},{"id":"N11","when":null,"options":[{"id":"minimum","set":{"permission":"minimum"},"end":null,"requires":null},{"id":"summary","set":{"permission":"summary"},"end":null,"requires":null}]},{"id":"N12","when":null,"options":[{"id":"private","set":{"disclosure":"private"},"end":null,"requires":null},{"id":"summary","set":{"disclosure":"summary"},"end":null,"requires":{"field":"permission","eq":"summary"}},{"id":"accuse","set":{"disclosure":"accuse"},"end":null,"requires":null},{"id":"expose","set":{"disclosure":"expose"},"end":null,"requires":null}]},{"id":"N13","when":{"any":[{"field":"disclosure","eq":"accuse"},{"field":"disclosure","eq":"expose"}]},"options":[{"id":"correct","set":{"disclosure":"private","corrected_claim":true},"end":null,"requires":{"field":"disclosure","eq":"accuse"}},{"id":"redact","set":{"disclosure":"private","privacy_repaired":true},"end":null,"requires":{"field":"disclosure","eq":"expose"}},{"id":"insist","set":{},"end":"HARM","requires":null}]},{"id":"N14","when":null,"options":[{"id":"truth","set":{"own_statement":"truthful"},"end":null,"requires":null},{"id":"cover","set":{"own_statement":"cover"},"end":null,"requires":null}]},{"id":"N15","when":{"field":"own_statement","eq":"cover"},"options":[{"id":"amend","set":{"own_statement":"amended"},"end":null,"requires":null},{"id":"insist","set":{},"end":"E13","requires":null}]},{"id":"N16","when":null,"options":[{"id":"owners","set":{"ownership":"confirmed","cost_requested":true},"end":null,"requires":null},{"id":"notes","set":{"ownership":"unconfirmed","cost_requested":true},"end":null,"requires":null}]},{"id":"N17","when":null,"options":[{"id":"cost","set":{"followup":"cost"},"end":"E10","requires":{"field":"cost_requested","eq":true}},{"id":"close","set":{"followup":"close"},"end":"E14","requires":null},{"id":"public","set":{"followup":"public"},"end":"E15","requires":{"field":"permission","eq":"summary"}},{"id":"site","set":{"followup":"site"},"end":"E16","requires":null}]}],"endings":{"E01":{"title":"人已经平安","hidden":false,"requires":{"field":"participation","eq":"unknown"}},"E02":{"title":"签完这一页","hidden":false,"requires":{"field":"participation","eq":"unknown"}},"E03":{"title":"陌生号码有了名字","hidden":false,"requires":{"all":[{"field":"participation","eq":"trace"},{"field":"trace_proven","eq":true}]}},"E04":{"title":"只到这条边线","hidden":false,"requires":{"field":"scope","eq":true}},"E05":{"title":"迟到的归还","hidden":false,"requires":{"all":[{"field":"custody","eq":"luo"},{"field":"custody_policy","eq":"defer"}]}},"E06":{"title":"暂缓的证言","hidden":false,"requires":{"all":[{"field":"scope","eq":true},{"field":"time","eq":false}]}},"E07":{"title":"改掉17:10","hidden":false,"requires":{"field":"time","eq":true}},"E08":{"title":"缺项清单","hidden":false,"requires":{"all":[{"field":"scope","eq":false},{"field":"time","eq":false}]}},"E09":{"title":"归还就到这里","hidden":false,"requires":{"all":[{"field":"custody","eq":"returned"},{"field":"custody_policy","eq":"deal"}]}},"E10":{"title":"先把这个月过完","hidden":false,"requires":{"all":[{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]},{"field":"followup","eq":"cost"}]}},"E11":{"title":"没有撤回的那句话","hidden":false,"requires":{"field":"disclosure","eq":"accuse"}},"E12":{"title":"你替谁公开","hidden":false,"requires":{"field":"disclosure","eq":"expose"}},"E13":{"title":"替她写下的名字","hidden":false,"requires":{"field":"own_statement","eq":"cover"}},"E14":{"title":"各自那一栏","hidden":false,"requires":{"all":[{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]},{"field":"followup","eq":"close"}]}},"E15":{"title":"获准公开的一页","hidden":false,"requires":{"all":[{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]},{"field":"permission","eq":"summary"},{"field":"followup","eq":"public"}]}},"E16":{"title":"重新划出的线","hidden":false,"requires":{"all":[{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]},{"field":"followup","eq":"site"}]}},"H01":{"title":"不用你再替我们说","hidden":true,"requires":{"all":[{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]},{"field":"followup","eq":"close"},{"field":"custody","eq":"chen"},{"field":"permission","eq":"minimum"},{"field":"disclosure","eq":"private"},{"field":"corrected_claim","eq":false},{"field":"privacy_repaired","eq":false},{"field":"own_statement","eq":"truthful"},{"field":"ownership","eq":"confirmed"}]}},"H02":{"title":"把错的一段补回来","hidden":true,"requires":{"all":[{"all":[{"field":"scope","eq":true},{"field":"time","eq":true}]},{"field":"followup","eq":"close"},{"field":"custody","eq":"returned"},{"field":"custody_policy","eq":"recovered"},{"field":"misdelivery_reported","eq":true},{"field":"corrected_claim","eq":true},{"field":"privacy_repaired","eq":false},{"field":"own_statement","eq":"truthful"}]}}}};
 const match=(p,s)=>!p?true:p.all?p.all.every(x=>match(x,s)):p.any?p.any.some(x=>match(x,s)):p.not?!match(p.not,s):s[p.field]===p.eq;
 const eligible=s=>s.morningStarted&&s.counterVisited&&s.counterConclusion&&['safe','lost'].includes(s.ending);
 function seed(s){return {...model.initial,early_call:s.departureCheckpoint?.contactVerified===true,address:s.departureRoute,
  custody:s.ending==='lost'?'luo':'chen',asked:s.morningQuestions.length?'now':'meeting',counter:s.videoChoice==='view'?'scoped_video':'records'};}
 function next(index,facts){while(index<model.nodes.length&&!match(model.nodes[index].when,facts))index++;return index;}
 function terminal(base,facts){
  if(base==='LIMITED')base=facts.scope&&!facts.time?'E06':facts.time?'E07':'E08';
  if(base==='HARM')base=facts.disclosure==='accuse'?'E11':'E12';
  if(base==='E14')for(const id of ['H01','H02'])if(match(model.endings[id].requires,facts)){base=id;break;}
  if(!model.endings[base]||!match(model.endings[base].requires,facts))throw new Error('Invalid ending gate');
  return base;
 }
 const challenge=(node,choice)=>({
  'N06T.scoped':'contact','N06T.formal':'contact','N08.compare':'outside',
  'N09.voluntary':'backfill','N09.formal':'backfill','N09R.originals':'gap','N10.complete':'separate'
 })[node+'.'+choice]||null;
 const requiredEvidence=(node,choice)=>challenge(node,choice)==='backfill'?['han','sun']:[];
 function begin(s){return {format:1,facts:seed(s),index:0,log:[],pending:null,ending:null,relationship:null};}
 function choices(run){return run.ending?[]:model.nodes[run.index].options.filter(o=>match(o.requires,run.facts));}
 function commit(run,id,answer,evidence=[]){
  if(run.ending)return null;
  const node=model.nodes[run.index],option=choices(run).find(o=>o.id===id);
  if(!option||challenge(node.id,id)&&answer!==challenge(node.id,id))return null;
  const required=requiredEvidence(node.id,id);
  if(required.length&&(!Array.isArray(evidence)||evidence.length!==2||!required.every(x=>evidence.includes(x))))return null;
  const facts={...run.facts,...option.set},log=[...run.log,{node:node.id,choice:id,answer:answer||null,evidence:required.length?[...evidence]:[]}];
  return {...run,facts,log,pending:null,index:option.end?run.index:next(run.index+1,facts),ending:option.end?terminal(option.end,facts):null,relationship:null};
 }
 function restore(s,raw){
  if(!eligible(s)||!raw||typeof raw!=='object')return null;
  if(raw.format!==undefined&&raw.format!==1)return null;
  let run=begin(s);
  if(Array.isArray(raw.log))for(const step of raw.log.slice(0,model.nodes.length)){
   if(!step||run.ending||model.nodes[run.index]?.id!==step.node)break;
   const updated=commit(run,step.choice,step.answer,step.evidence===undefined&&raw.format===undefined?requiredEvidence(step.node,step.choice):step.evidence);if(!updated)break;run=updated;
  }
  if(!run.ending&&choices(run).some(o=>o.id===raw.pending))run.pending=raw.pending;
  if(run.ending&&['continue','bounded','distance'].includes(raw.relationship))run.relationship=raw.relationship;
  return run;
 }
 function rewind(s,run,count){return restore(s,{log:run.log.slice(0,Math.max(0,Math.min(count,run.log.length)))});}
 function date(run,pending=false){
  const n=model.nodes[run.index]?.id;
  if(n==='N17'&&pending&&run.pending==='site')return '12月 / 专业复核与整改';
  const upcoming=pending?model.nodes[run.index]?.options.find(o=>o.id===run.pending):null;
  if(run.facts.delay||upcoming?.set.delay)return '11月06日 / 资料核对';
  if(n==='N17')return '11月 / 更正后的后续';
  if(pending&&n==='N10'&&['scope_only','time_only'].includes(run.pending))return '11月 / 本次请求的回复';
  if(pending&&n==='N06'&&run.pending==='witness')return '10月26日—11月 / 本人说明';
  if(pending&&n==='N07'&&run.pending==='deal')return '10月28日 / 实际归还';
  if(pending&&n==='N09'&&run.pending==='voluntary')return '10月27—28日 / 分别核对';
  return ['N06'].includes(n)?'10月26日 09:30':n==='N06T'?'10月27日 / 联络核对':n==='N07'?'10月26日下午':n==='N08'?'10月26日 14:30':n==='N09'?'10月27日': '10月28日';
 }
 root.MidnightStoryRules=Object.freeze({model,match,eligible,begin,choices,commit,restore,rewind,challenge,date,requiredEvidence});
})(globalThis);

// Narrative UI: scene -> proposed action -> observed result -> explicit confirmation.
(function(root){
 'use strict';
 const R=root.MidnightStoryRules,C=root.MidnightStoryContent;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const btn=(id,label,secondary=false)=>`<button class="${secondary?'secondary wide':'primary wide'}" data-story-command="${id}">${label}</button>`;
 const map=`<figure class="scope-map"><figcaption>A-02范围图／经允许的副本示意</figcaption><div class="map-body"><div class="map-main">A区主楼<br><small>实线内：本报告范围</small></div><div class="map-side">东门 → 等候处 → 转折<br><b>S1维修段 → 储物间</b><small>虚线：范围外，不进入维修段</small></div></div><p>同址：榆平街17号。A-02实线止于主楼外墙，S1在实线外。</p><p>报告JC-JC-260807-A／8月7日；附件目录未列S1。交接索引另列S1-01，不是这份报告的已签附页。</p></figure>`;
 const requirement=(id,o,f)=>{
  if(id==='N10')return o.id==='scope_only'?'尚未核实范围；可选择补齐材料。':o.id==='time_only'?'尚未取得补录指令的交叉来源；可申请补齐。':o.id==='continue'?'两条链尚有缺项；请补齐或按现有范围结束。':'两条链均已核实，可限定提交或继续。';
  if(id==='N12'&&o.id==='summary'||id==='N17'&&o.id==='public')return '当前没有公开摘要授权。可在选择记录中返回授权问题，重新取得同意。';
  if(id==='N13')return f.disclosure==='accuse'?'此处需要更正的是无依据指控。':'此处需要撤下的是未授权资料。';
  return '当前未满足此项前提，可返回此前选择核对。';
 };
 function intro(run,s){
  const id=R.model.nodes[run.index].id;
  let html=C.nodes[id].intro;
  if(id==='N06')html=(s.morningQuestions.includes('station')?'<p class="tip">你在08:10已问过北站短信。现在她解释为何那样安排，不再当作新的失联谜题。</p>':'<p class="tip">08:10已确认人平安。短信的解释留到现在，她应当直接说清。</p>')+html;
  if(id==='N08')html+=s.ending==='safe'?'<div class="source-slip"><b>陈默签收的两张借阅原页／许可核对</b><p>陈依清单出示完整页，只在旁做自己的对照，不往原页添字。14:20巡查记S1需临时封闭；另一张登记载17:10。蓝圈在林的对照稿，不在原页上。核对后仍按借还登记归还单位。</p></div>':'<p class="tip">以下报告副本来自陈经手的获准材料。两张借阅原页仍在罗处，林的局部扫描不替代完整原页。</p>';
  if(id==='N09')html+='<div class="source-slip"><b>目前可读的登记来源</b><p>'+(s.ending==='safe'?'陈许可核对的借阅原页。':'林所留的局部扫描，缺边栏，完整原页尚待追还。')+'登记正文记17:10，不自证何时填写或何时真的封闭。</p></div>';
  if(id==='N10')html+=`<div class="fact-summary"><p>报告范围：${run.facts.scope?'已核对图例与目录':'未完成核对'}</p><p>补录指令：${run.facts.time?'已有交叉来源':'仍缺必要来源'}</p><p>原件：${custody(run.facts)}</p></div>`;
  if(id==='N16'&&run.facts.privacy_repaired)html='<p class="tip">何家仍通过指定联系人。以下由获准渠道核对，你没有再直接到访。</p>'+html;
  return html;
 }
 function custody(f){return f.custody==='luo'?'误交后尚未追回，完整去向以实际核对为准':f.custody==='returned'?'有权人员已核对归还；误交空档仍在':'陈的签收链可核；归还以本轮实际场景为准';}
 function result(run,s){
  const node=R.model.nodes[run.index],id=node.id,o=C.nodes[id].options[run.pending];
  let html=o.result;
  if(id==='N09'&&['voluntary','formal'].includes(run.pending)||id==='N10'&&run.pending==='complete')html+='<p>你调出10月25日晚的取件消息。孙出示转发你号码的原会话；罗通过经单位核对的联络方式，确认消息是他发的。陈的答复另列：没有委托。</p>'+(s.ending==='lost'?'<p>实际取送还由姚斌本单说明与单位收到纸袋的记录交叉核对，未补造遗失签单。</p>':'<p>10月25日晚，文件没有交给司机。这次核对的是发信和转号，没有取送订单。</p>');
  if(id==='N06T')html+=s.ending==='lost'?'<p>姚斌经本单核对说明00:08在罗办公室楼下交袋。你看到限定的取送记录，没看到付款账户实名；司机默认只接一趟普通订单。缺的签单不由这份说明补造。</p>':'<p>10月25日晚没有向司机交袋。单位分别核对罗确认的联系、孙的转号和陈的答复，没有本次司机取送记录。原页依陈的签收链办理归还。</p>';
  if(id==='N08'&&run.pending==='compare')html=map+Object.values(C.nodes.N08.documents).map(d=>`<details class="source-slip"><summary>${esc(d.title)}</summary>${d.html}</details>`).join('')+html;
  if(id==='N10'&&run.pending==='complete')html=map+html;
  if(id==='N06'&&run.pending==='witness')html+=s.ending==='lost'?'<p>本人的说明注明签单随袋离开，只有当时见过一个姓。不存在你持有的签单副本。</p>':'<p>本人的说明附陈00:03的清点与签收来源，不能据此证明柜台暂存全程未变。</p>';
  if(id==='N10'&&run.pending==='gaps')html+=`<div class="fact-summary"><p>范围：${run.facts.scope?'已核实，可请求更正':'缺范围图／目录交叉来源'}</p><p>补录：${run.facts.time?'已有交叉来源':'指令来源待核，不能确认罗下令'}</p></div>`;
  return html;
 }
 const sourceNames={boundary:'A-02实际边线与图例',index:'报告附件目录与交接索引的对照',han:'韩的实际封闭上报消息与本人说明',sun:'孙原接收的17:10指令与本人说明'};
 function history(run,s){
  if(!run.log.length)return '';
  return `<section class="choice-history" aria-label="本轮选择记录"><h4>本轮选择记录</h4><p class="tip">选一条记录，单独回看当时所见与已确认的结论。</p><ol class="record-index">${run.log.map((x,i)=>`<li class="history-row"><div class="history-entry"><span class="small-label">记录 ${i+1} / 已确认</span><h4>${esc(C.nodes[x.node].title)}</h4><small>${esc(C.nodes[x.node].options[x.choice].label)}</small></div><div class="record-actions"><button class="secondary" data-story-record="${i}" aria-label="回看记录${i+1}：${esc(C.nodes[x.node].title)}">回看当时所见</button><button class="secondary" data-story-replay="${i}">重选</button></div></li>`).join('')}</ol><p class="tip">重选需要确认，会清除该条及之后的知情、材料与结局。</p></section>`;
 }
 function record(run,s){
  const i=s.storyRecord,x=run.log[i],before=R.restore(s,{format:2,log:run.log.slice(0,i)}),seen={...before,pending:x.choice},c=C.nodes[x.node];
  const q=C.quizzes[R.challenge(x.node,x.choice)],answer=q?.options.find(([id])=>id===x.answer)?.[1];
  return `<header class="window-heading"><span class="small-label">记录 ${i+1} / ${run.log.length} · 已确认</span><h3>${esc(c.title)}</h3><p>${esc(R.date(seen,true))} / ${esc(c.place)}</p>${paneButton('archive','返回手记目录')}</header><article class="note reading-sheet"><h4>你当时的选择</h4><p>${esc(c.options[x.choice].label)}</p><h4>当时所见</h4>${result(seen,s)}${answer?`<section class="confirmed-conclusion"><h4>你确认的结论</h4><p>${esc(answer)}</p>${x.evidence.length?`<p>核对来源：${x.evidence.map(id=>esc(sourceNames[id])).join('；')}。</p>`:''}</section>`:''}</article><nav class="window-actions" aria-label="记录翻页">${i>0?`<button class="secondary" data-story-record="${i-1}">上一条记录</button>`:''}${i+1<run.log.length?`<button class="secondary" data-story-record="${i+1}">下一条记录</button>`:''}${paneButton('archive','返回手记目录')}<button class="secondary" data-story-replay="${i}">从这条重选…</button></nav>`;
 }

 const relationships={continue:'你答应以后还可以来往。要你承担风险的事，林遥得事先说明；这次的记录不会因此改写。',bounded:'你告诉林遥，必要事项仍可联系，私人往来先缓一缓。她把这个约定记下来，没有再让陈默替她劝你。',distance:'你约好交还手机和物品，随后各自生活。她仍要完成自己的说明，你也不再替她保管新的材料。'};
 const basePanes=s=>s.story.ending?['ending','relationship','archive']:s.story.pending?(R.challenge(R.model.nodes[s.story.index].id,s.story.pending)?['source','check','archive']:['source','archive']):['scene','decision','archive'];
 const validRecord=s=>Number.isInteger(s.storyRecord)&&s.storyRecord>=0&&s.storyRecord<s.story.log.length;
 const panes=s=>[...basePanes(s),...(validRecord(s)?['record']:[])];
 const pane=s=>panes(s).includes(s.storyView)?s.storyView:panes(s)[0];
 const paneNames={scene:'现场与对话',decision:'下一步选择',source:'所见材料与回应',check:'核对桌',archive:'调查手记',ending:'本轮尾声',relationship:'与林遥的往来',record:'记录详情'};
 const paneButton=(id,label)=>`<button class="secondary" data-story-pane="${id}">${label||paneNames[id]}</button>`;
 function ending(run,s){
  const e=R.model.endings[run.ending];let epilogue=C.endings[run.ending];
  if(run.ending==='E03')epilogue=epilogue.replace('姚斌只与实际发生的本单有关，保住袋子的路线没有他的订单。',s.ending==='lost'?'姚斌只确认自己这一单收送，不替罗保证授权。':'当夜没有发生司机取送，你核对的仍只是罗本人联络和孙的转号。');
  return `<article class="ending reading-sheet"><span class="ending-id">${e.hidden?'隐藏结局':'本轮结局'} ${esc(run.ending)}</span><h3>${esc(e.title)}</h3>${epilogue}<div class="divider"></div><p class="tip">本轮已结束。可在手记回看所见，也可重选此前场景。</p><div class="window-actions">${paneButton('relationship','决定之后怎样来往')}${paneButton('archive','翻开本轮手记')}</div></article>`;
 }
 function archive(run,s){return `<header class="window-heading"><span class="small-label">NOTEBOOK / 仅本轮所见</span><h3>调查手记</h3><p>按场景回看原话与材料。阅读不会推进剧情；重选时才清除后续进展。</p></header>${run.pending?`<aside class="pending-record reading-sheet"><span class="small-label">本项尚未确认</span><h4>${esc(C.nodes[R.model.nodes[run.index].id].options[run.pending].label)}</h4><p>所见材料仍可回看。草稿还没有记入下方已确认记录。</p><div class="window-actions">${paneButton('source','返回本次材料')}${R.challenge(R.model.nodes[run.index].id,run.pending)?paneButton('check','继续本次核对'):''}</div></aside>`:''}${history(run,s)||'<p class="empty">你还没有确认后续选择。</p>'}<details class="fact-summary"><summary>已核对与尚缺的部分</summary><p>报告范围：${run.facts.scope?'已核实':'尚未核实／未参与'}</p><p>补录：${run.facts.time?'有交叉来源':'尚未核实／未参与'}</p><p>${custody(run.facts)}</p></details>${btn('review-start','回看第二幕核对处',true)}`;}

 function render(s){
  const run=s.story,view=pane(s),node=R.model.nodes[run.index],c=C.nodes[node.id];
  const nav=`<nav class="story-windows" aria-label="本场窗口">${panes(s).map(id=>`<button data-story-pane="${id}" aria-current="${id===view?'page':'false'}"><span>${id==='archive'?'▤':id==='source'?'▱':id==='check'?'⌁':id==='decision'?'↗':'◌'}</span>${paneNames[id]}</button>`).join('')}</nav>`;
  let body='';
  if(view==='ending')body=(root.MidnightArt.figure(root.MidnightArt.current(s),true))+ending(run,s);
  if(view==='relationship')body=`<article class="note reading-sheet"><span class="small-label">AFTERWARDS / 关系尾声</span><h3>与林遥的往来</h3><p>往来方式与你查清的事分开。这里的选择不改本轮调查结局。</p>${Object.entries(relationships).map(([id,text])=>`<button class="choice" data-story-relationship="${id}" aria-pressed="${run.relationship===id}">${id==='continue'?'继续来往，风险先说':id==='bounded'?'只保留必要联系':'交还物品，各自生活'}</button>${run.relationship===id?`<p class="relationship-note">${text}</p>`:''}`).join('')}${paneButton('ending','回到本轮尾声')}</article>`;
  if(view==='archive')body=archive(run,s);
  if(view==='record')body=record(run,s);
  if(view==='scene')body=`${root.MidnightArt.figure(root.MidnightArt.current(s))}<article class="note reading-sheet"><span class="small-label">${esc(R.date(run))} / ${esc(c.place)}</span><h3>${esc(c.title)}</h3>${intro(run,s)}<div class="window-actions">${paneButton('decision','想好后，决定下一步')}${paneButton('archive','回看手记')}</div></article>`;
  if(view==='decision')body=`<header class="window-heading"><span class="small-label">YOUR NEXT STEP / ${esc(c.place)}</span><h3>${esc(c.question)}</h3><p>选择后进入回应或材料窗口。阅读实际结果后，再确认推进。</p>${paneButton('scene','回到现场与对话')}</header><div class="story-choices decision-grid">${node.options.map(o=>{const yes=R.match(o.requires,run.facts),v=c.options[o.id];return `<button class="choice" data-story-choice="${o.id}" ${yes?'':'disabled'}>${esc(v.label)}<small>${esc(yes?v.note:requirement(node.id,o,run.facts))}</small></button>`;}).join('')}</div>`;
  if(view==='source'){
   const challenge=R.challenge(node.id,run.pending);
   body=`<header class="window-heading"><span class="small-label">${esc(R.date(run,true))} / ${esc(c.place)}</span><h3>${esc(c.options[run.pending].label)}</h3><p>这项选择之后，你实际看见、听见的内容。</p></header><article class="note reading-sheet story-result">${result(run,s)}</article>${c.interviews&&(node.id==='N08'&&run.pending==='compare'||node.id==='N09'&&run.pending==='voluntary')?`<section class="conversation-record reading-sheet"><h3>还有哪句话要问清楚？</h3><p class="tip">各人只回答自己经手或经历的部分。追问可选，不要求问满。</p>${Object.entries(c.interviews).map(([id,v])=>`<button class="secondary wide" data-interview="${id}">${esc(v.question)}</button>${s.storyQuestions.includes(id)?`<article class="conversation-record">${v.html}</article>`:''}`).join('')}</section>`:''}<div class="window-actions">${challenge?paneButton('check','带着材料，前往核对桌'):btn('confirm','确认这项结果，继续')}${btn('cancel','返回本题，换一个选择',true)}</div>`;
  }
  if(view==='check'){
   const q=C.quizzes[R.challenge(node.id,run.pending)];
   body=`<header class="window-heading"><span class="small-label">CROSS CHECK / 核对桌</span><h3>你的结论能写到哪里？</h3><p>依据当前材料作答。随时返回原始内容，不会丢失这次选择。</p>${paneButton('source','展开本次原始材料')}</header><form id="story-proof-form">${C.sourceChecks[R.challenge(node.id,run.pending)]?`<fieldset><legend>${esc(C.sourceChecks[R.challenge(node.id,run.pending)].legend)}</legend>${Object.entries(C.sourceChecks[R.challenge(node.id,run.pending)].options).map(([id,label])=>`<label class="evidence-option"><input type="checkbox" name="story-source" value="${id}" ${s.storyEvidence.includes(id)?'checked':''}><span>${esc(label)}</span></label>`).join('')}</fieldset>`:''}<fieldset><legend>${esc(q.question)}</legend>${q.options.map(([id,text])=>`<label class="evidence-option"><input type="radio" name="story-proof" value="${id}" ${s.storyAnswer===id?'checked':''} required><span>${esc(text)}</span></label>`).join('')}</fieldset><p id="story-proof-error" class="error" role="status"></p><button class="primary" type="submit">记下核对结果，继续</button></form>${btn('cancel','返回本题，换一个选择',true)}`;
  }
  return `<div class="story-workspace" data-story-view="${view}">${nav}<section class="workspace-content" aria-label="${paneNames[view]}">${body}</section></div>`;
 }
 root.MidnightStory=Object.freeze({render,history,result,panes,pane});
})(globalThis);

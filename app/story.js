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
  if(id==='N09'&&['voluntary','formal'].includes(run.pending)||id==='N10'&&run.pending==='complete')html+='<p>另就昨夜联络，孙出示把你号码转给罗的相关原会话，罗经单位核对的联络方式确认发出代收消息。陈分别确认从未委托。冒名联系有这一组来源，不由八月的补录消息推出来。</p>'+(s.ending==='lost'?'<p>实际取送还由姚斌本单说明与单位收到纸袋的记录交叉核对，未补造遗失签单。</p>':'<p>你昨夜保住了文件，没有司机收送可查。这里核对的是发信与转号，不生成订单。</p>');
  if(id==='N06T')html+=s.ending==='lost'?'<p>姚斌经本单核对说明00:08在罗办公室楼下交袋。你看到限定的取送记录，没看到付款账户实名；司机默认只接一趟普通订单。缺的签单不由这份说明补造。</p>':'<p>昨夜没有向司机交袋。单位核对的是罗本人确认的联系、孙的转号及陈的否认，没有编出一张不存在的取送订单。原页依陈的签收链办理归还。</p>';
  if(id==='N08'&&run.pending==='compare')html=map+html;
  if(id==='N10'&&run.pending==='complete')html=map+html;
  if(id==='N06'&&run.pending==='witness')html+=s.ending==='lost'?'<p>本人的说明注明签单随袋离开，只有当时见过一个姓。不存在你持有的签单副本。</p>':'<p>本人的说明附陈00:03的清点与签收来源，不能据此证明柜台暂存全程未变。</p>';
  if(id==='N10'&&run.pending==='gaps')html+=`<div class="fact-summary"><p>范围：${run.facts.scope?'已核实，可请求更正':'缺范围图／目录交叉来源'}</p><p>补录：${run.facts.time?'已有交叉来源':'指令来源待核，不能确认罗下令'}</p></div>`;
  return html;
 }
 function history(run,s){
  if(!run.log.length)return '';
  return `<details class="choice-history"><summary>本轮选择记录 / 回到此前场景</summary><p class="tip">回退会清除所选场景之后的后续知情、材料与结局。确认前保留当前进度。</p>${run.log.map((x,i)=>`<div class="history-row"><div class="history-entry">${esc(C.nodes[x.node].title)}<small>${esc(C.nodes[x.node].options[x.choice].label)}</small><details><summary>回看当时所见</summary>${result({...R.restore(s,{log:run.log.slice(0,i)}),pending:x.choice},s)}</details></div><button class="secondary" data-story-replay="${i}">重选</button></div>`).join('')}</details>`;
 }
 function ending(run,s){
  const e=R.model.endings[run.ending];
  const relationships={continue:'你答应以后还可以来往。要你承担风险的事，林遥得事先说明；这次的记录不会因此改写。',bounded:'你告诉林遥，必要事项仍可联系，私人往来先缓一缓。她把这个约定记下来，没有再让陈默替她劝你。',distance:'你约好交还手机和物品，随后各自生活。她仍要完成自己的说明，你也不再替她保管新的材料。'};
  let epilogue=C.endings[run.ending];
  if(run.ending==='E03')epilogue=epilogue.replace('姚斌只与实际发生的本单有关，保住袋子的路线没有他的订单。',s.ending==='lost'?'姚斌只确认自己这一单收送，不替罗保证授权。':'当夜没有发生司机取送，你核对的仍只是罗本人联络和孙的转号。');
  return `<article class="ending"><span class="ending-id">${e.hidden?'隐藏结局':'本轮结局'} ${esc(run.ending)}</span><h3>${esc(e.title)}</h3><p class="section-label">后续与尾声 / 按本轮参与范围</p>${epilogue}<div class="divider"></div><p class="tip">本轮已结束。可保留这个终点，也可以在记录中选择此前场景回放。其他未见结局不会在这里提前展开。</p></article>
  <details class="fact-summary"><summary>本轮依据与保管边界</summary><p>报告范围：${run.facts.scope?'已核实':'未完成核对／未进入该项'}</p><p>补录指令：${run.facts.time?'有交叉来源':'未完成核对／未进入该项'}</p><p>本轮原件依据：${custody(run.facts)}</p><p>你的说明：${run.facts.own_statement==='cover'?'保留了矛盾说法':run.facts.own_statement==='amended'?'已修改并保留痕迹':'按实际参与范围说明'}</p></details>
  <article class="note"><h3>与林遥的往来</h3><p>这是独立的关系尾声，不更改本轮调查结果。你不必为查清事情选择原谅。</p>${Object.entries(relationships).map(([id,text])=>`<button class="choice" data-story-relationship="${id}" aria-pressed="${run.relationship===id}">${id==='continue'?'继续来往，风险先说':id==='bounded'?'只保留必要联系':'交还物品，各自生活'}</button>${run.relationship===id?`<p class="relationship-note">${text}</p>`:''}`).join('')}</article>${history(run,s)}${btn('review-start','回看第二幕完成处',true)}`;
 }
 function render(s){
  const run=s.story;
  if(run.ending)return ending(run,s);
  const node=R.model.nodes[run.index],c=C.nodes[node.id];
  if(run.pending){
   const challenge=R.challenge(node.id,run.pending),q=challenge&&C.quizzes[challenge];
   return `<p class="section-label">${esc(R.date(run,true))} / ${esc(c.place)}</p><article class="note story-result"><span class="small-label">这项选择之后</span><h3>${esc(c.options[run.pending].label)}</h3>${result(run,s)}</article>${q?`<form id="story-proof-form"><fieldset><legend>${esc(q.question)}</legend>${q.options.map(([id,text])=>`<label class="evidence-option"><input type="radio" name="story-proof" value="${id}" required><span>${esc(text)}</span></label>`).join('')}</fieldset><p id="story-proof-error" class="error" role="status"></p><button class="primary wide" type="submit">记下核对结果，继续</button></form>`:btn('confirm','确认这项结果，继续')}${btn('cancel','返回本题，换一个选择',true)}${history(run,s)}`;
  }
  return `<p class="section-label">${esc(R.date(run))} / ${esc(c.place)}</p><article class="note"><h3>${esc(c.title)}</h3>${intro(run,s)}</article><h3 class="question-title">${esc(c.question)}</h3><div class="story-choices">${node.options.map(o=>{const yes=R.match(o.requires,run.facts),v=c.options[o.id];return `<button class="choice" data-story-choice="${o.id}" ${yes?'':'disabled'}>${esc(v.label)}<small>${esc(yes?v.note:requirement(node.id,o,run.facts))}</small></button>`;}).join('')}</div>${history(run,s)}<p class="tip">选择后先阅读实际后果，再确认。进度保存在当前浏览器。故事中的提交和公开不连接任何外部服务。</p>`;
 }
 root.MidnightStory=Object.freeze({render,history,result});
})(globalThis);

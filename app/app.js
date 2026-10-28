'use strict';
(() => {
 const R=globalThis.MidnightRules, C2=globalThis.MidnightChapter2, SR=globalThis.MidnightStoryRules, S=globalThis.MidnightStory, KEY='after-hours-midnight-v05-rc1';
 const definitions={
  scheduled:{title:'旧机的本地发送记录',rows:[['来源','餐桌上的林遥旧机'],['号码','林遥的个人号'],['发出时间','10月25日23:17'],['收件人','你（许岑）'],['短信','到北站了。明早再说。']],description:'你在23:17收到短信；留在餐桌上的旧机里有同一条已发送记录。',location:true},
  photo:{title:'照片与你2024年的会话',rows:[['相册文件','IMG_20240516_1829.jpg'],['文件显示拍摄日','2024-05-16'],['最近保存','10月25日18:54'],['另一处记录','你保存的2024-05-16会话'],['当时收到的附件','同一幅候车厅照片']],description:'旧机相册在10月25日存入这幅图。你2024年的会话里，也有同一幅候车厅照片。',location:true},
  receipt:{title:'青禾洗衣入柜凭证',rows:[['来源','青禾发到林遥个人号的凭证'],['商户','青禾24h自助洗衣'],['入柜时间','10月25日21:06'],['柜号','B17'],['附注','可先放柜台，腾柜后入柜出票']],description:'青禾洗衣，B17，21:06入柜。附注写着可以先在柜台暂存。',location:true},
  promise:{title:'你保留的2021年旧会话',rows:[['来源','你自己的旧会话记录'],['日期','2021 年 11 月 02 日'],['你：修好了，明天拿给你。','23:16'],['林遥：行，晚安。','23:17']],description:'修手机那天，林遥在 23:17 说了晚安。',location:false},
  contact:{title:'林遥授权的交接便签',rows:[['来源','她允许你查的旧机便签'],['本机显示修改时间','10月25日18:36'],['接收人','陈默，档案组'],['补充','让他本人拿。收件凭证一并给他。']],description:'便签指定陈默本人取件，并要保留收件凭证。',location:false}
 };
 Object.assign(definitions,C2.clues);
 const hints={
  investigate:['先分清每条记录从哪部手机取得。','对照旧机发送记录，以及你在2024年已收到的同图会话。','选「旧机的本地发送记录」和「照片与你2024年的会话」。取件地点另看青禾凭证。'],
  departure:['你要把地址发给谁？','知道陈老师的称呼，不等于有他的委托。','可以先回拨陈的既存号码，只把地址发给确认过的人。'],
  locker:['便签里写了取码约定。再找找以前的会话。','林遥说「晚安」的时间值得留意。','输入 2317。'],
  counter:['把交袋、入柜和领取分开记。','电子凭证和店内操作行是同笔业务；另找一份能说明柜台暂存的材料。','21:06对应入柜。选凭证或操作行，再配暂存简记或获准看过的片段；中间保管与袋内内容仍未连续核实。'],
  handoff:['取件人的身份，手机里有没有约定？','再看未命名便签，留意“本人”两个字。','陈默是指定接收人，陌生号码的身份尚未核实。']
 };
 let state=R.initial(),activeClue=null,toastTimer,storyReplayIndex=null;
 try{state=R.normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{}
 const screen=document.querySelector('#screen');
 const placeCount=()=>state.clues.filter(id=>definitions[id].location).length;
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
 const action=(id,label)=>`<button class="inspect-button" data-clue="${id}">${state.clues.includes(id)?'✓ 已记录 · ':''}${label}<small>检查记录</small></button>`;
 function notify(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
 function hint(){const key=state.stage,level=state.hints[key]||0;return `<div class="hint-box"><button class="secondary wide" data-command="hint">${level===3?'提示已全部展开':level?'再给一点提示':'需要一点提示'}</button><div aria-live="polite">${(hints[key]||[]).slice(0,level).map(t=>`<p class="tip">${t}</p>`).join('')}</div></div>`;}
 function chenContact(){if(state.morningStarted)return '<article class="thread"><div class="thread-head"><strong>昨夜通话 / 陈默</strong><time>已有号码</time></div><p>陈默已明确说过，没有委托司机取件。这里保留的是昨夜的回拨与回电记录。</p></article>';return `<article class="thread">
 <div class="thread-head"><strong>你的通讯录 / 陈默</strong><time>原来存的号码</time></div>
 <p>你替档案组印培训材料时，陈默来取过。你见过他两次，号码一直存着。</p>
 ${state.contactVerified?'<blockquote>「我还在地铁上。没托人拿。地址发我，出站就过去。」</blockquote>':'<button class="secondary wide" data-command="call-chen">给陈默打电话</button>'}
 </article>`;}
 function messages(){return `<p class="section-label">第一幕 / 最后一条消息</p><article class="role-card"><span class="small-label">你的身份 · 许岑</span>${state.morningStarted?'<p>以下保留10月25日当晚的消息与记录。林遥已在次日08:10来电报平安。</p>':'<p>你和林遥从2019年就认识。下午，她来你家给旧手机充电。现在快午夜了，她还没回来。</p>'}</article><p class="section-label">你的手机 / 收到的消息</p>
 <article class="thread"><div class="thread-head"><strong><span class="avatar" aria-hidden="true">遥</span>林遥</strong><time>10月25日</time></div>
 <p>她的旧手机还在餐桌边充电，个人号的卡也留在里面。下楼时，她只拿了工作机。</p>
 <div class="chat-time">21:12 · 工作号 → 你</div><div class="bubble">下楼买包烟。门别反锁。</div>
 <div class="chat-time">23:17 · 个人号短信 → 你</div><div class="bubble">到北站了。明早再说。</div>
 <p>你拨了她的工作号。铃声响到自动挂断。<br>餐桌边的旧手机还连着充电线。你按亮屏幕，短信栏里也有刚才那句话。</p>${action('scheduled','核对旧机的发送记录')}</article>
 <article class="thread"><div class="thread-head"><strong>陌生号码 / 发给你</strong><time>23:16</time></div><div class="bubble stranger">你好，我替陈老师拿点材料。林遥手机一直占线。你要是见到她，麻烦跟她说一声。</div><p class="tip">你的拨号记录：两通，均未接听。</p></article>
 ${chenContact()}
 <article class="thread"><div class="thread-head"><strong>你的旧会话 / 林遥</strong><time>2021</time></div><p>2021年，你替她送修过这部手机。取回来那天，你们聊了几句。</p>${action('promise','查看修机那天的聊天')}</article>
 <article class="memory"><span class="small-label">下午 / 她离开前</span><p>她把旧手机放到充电线旁，说：</p><blockquote>“陈默来拿东西，要单子就看便签和那几条记录。相册里那张北站图也能看，别的先别翻。”</blockquote></article>`;}
 function album(){return `<p class="section-label">授权相册 / 你的旧会话</p>
  <article class="thread"><div class="thread-head"><strong>北站</strong><time>1 / 2</time></div>
  <div class="photo" role="img" aria-label="北站候车厅示意图，左下方有贴黄色胶带的行李箱"><div class="station-roof" aria-hidden="true"></div><div class="station-sign">北 站<small>NORTH STATION</small></div><div class="station-bench" aria-hidden="true"></div><div class="luggage" aria-hidden="true"></div><small>场景示意</small></div>
  <p>左下角的行李箱贴着黄胶带。你翻到2024年5月16日的会话：同一个箱子，胶带也在同一处。</p><div class="bubble"><span class="chat-time">你的旧会话 · 2024-05-16</span><br>林遥：北站这边还有座。<br><small>附件：同一幅候车厅图（场景示意）</small></div>${action('photo','核对照片与旧会话')}</article>
  <article class="thread"><div class="thread-head"><strong>旧个人号 / 商户凭证</strong><time>2 / 2</time></div>
  <div class="receipt"><strong>青禾 24h</strong><br>自 助 洗 衣 · 临 时 寄 存<hr>入柜操作　10月25日21:06<br>ITEM　寄存服务<br>BOX　 B17<hr>可先放柜台，腾柜后入柜出票<br>请保留凭证</div>${action('receipt','展开寄存凭证')}</article>`;}
 function notes(){return `<p class="section-label">便签 / 未命名</p>
  <article class="note"><h3>取件</h3>陈默，档案组。让他本人拿。<br>收件凭证别扔，他那边要留底。<br><br>柜码：修好旧手机那天，第一次说晚安的时间。<br>四位，不加冒号。${action('contact','记录接收人约定')}</article>
  <p class="tip">页脚显示，这张便签最后改于10月25日18:36。</p>`;}
 function laundryArt(){return '<div class="laundry-scene" role="img" aria-label="夜里的青禾洗衣店示意：暖灯下有两台滚筒洗衣机，寄存柜在右侧"><span class="shop-sign">青禾 <small>24h LAUNDRY</small></span><div class="washer one"></div><div class="washer two"></div><div class="cabinet">B17</div><span class="scene-caption">23:36 / 青禾洗衣 · 场景示意</span></div>';}
 function investigation(){
  if(state.stage==='story'&&state.story)return S.render(state);
  if(C2.isStage(state))return C2.render(state,{action,hint});
  if(state.stage==='ending')return ending();
  if(state.stage==='departure')return `<p class="section-label">23:24 / 出门前</p><article class="note"><h3>青禾洗衣，B17</h3>你从椅背上拿起外套，摸到口袋里的钥匙。刚走到门边，手机又亮了，是那个陌生号码。<blockquote>“在哪儿碰面？”</blockquote></article>${chenContact()}<h3 class="question-title">把取件地址发给谁？</h3><button class="choice" data-route="chen">只发给通讯录里的陈默<small>陌生号码没有得到青禾位置。</small></button><button class="choice" data-route="stranger">回复陌生号码：青禾洗衣，B17<small>把凭证上的商户和柜号发过去。</small></button>${hint()}<button class="secondary wide" data-command="back">先回看材料</button>`;
  if(state.stage==='locker')return `<p class="section-label">青禾洗衣 / B17</p>${laundryArt()}
   <article class="note"><h3>柜门</h3>23:36，你推开青禾的玻璃门。烘干机里的外套翻了一圈，袖子贴在玻璃上。<br><br>店主从账本上抬头。柜台立着一块服务牌：孟雪。<br><br>B17在最下一排。柜旁贴着“柜台先收，腾柜后入柜”。你蹲下，按亮数字面板。</article>
   <form id="code-form"><label class="tip" for="locker-code">四位柜码</label><input id="locker-code" class="code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" aria-describedby="code-error" required placeholder="····"><p id="code-error" class="error" role="status"></p><button class="primary wide" type="submit">开柜</button></form>${hint()}<button class="secondary wide" data-command="back">返回调查</button>`;
  if(state.stage==='handoff')return `<p class="section-label">B17 / 文件袋</p>
   <article class="note"><h3>八张纸</h3>纸袋没有封口。袋面写着：“原页2，报告复印3，对照稿2，收件单1。”<br><br>你照着数了八张。蓝圈都在对照稿上，两张标作原页的另夹在里面。<br><br>孟雪看了你手机上的柜号，打印机吐出一张小票。<blockquote>“这个拿好。”</blockquote></article>
   ${state.departureRoute==='stranger'?'<p class="tip">你发过青禾地址。玻璃门外，一辆车停在路边。陌生号码又发来：“交给司机就行。”</p>':'<p class="tip">你只把地址发给了陈默。陌生号码还在问在哪儿碰面。</p>'}<h3 class="question-title">你怎么交接？</h3>
   <button class="choice" data-recipient="chen">回拨陈的既存号码，等本人来取<small>核实有无委托，再按清单交接。</small></button>
   ${state.departureRoute==='stranger'?`<button class="choice" data-recipient="courier">交给已到路边的司机<small>${state.contactVerified?'陈已否认委托，继续交付仍有风险。':'代收授权尚未核实。'}</small></button>`:''}${hint()}`;
  const evidence=state.clues.length?state.clues.map(id=>`<article class="evidence"><strong>${definitions[id].title}</strong><p>${definitions[id].description}</p></article>`).join(''):'<p class="empty">还没记下材料。<br>先看看消息、图片和便签。</p>';
  const question=state.deduction?`<p class="deduction-done">✓ 这些记录还不能确认她此刻在北站。</p>
   <h3 class="question-title">当晚的记录支持去哪里取件？</h3>
   ${state.clues.includes('receipt')?`<button class="choice" data-location="station">北站<small>23:17 消息提及的地点。</small></button><button class="choice" data-location="laundry">青禾洗衣店<small>寄存凭证上的商户。</small></button><button class="choice" data-location="home">林遥住处<small>这份材料没有指向她家。</small></button><p id="location-feedback" class="error" role="status"></p>`:'<p class="tip">还需要一份当晚产生的记录。相册里是否还有别的材料？</p>'}`:
   `<h3 class="question-title">找出两份看似指向北站、却不能确认当晚行程的材料。</h3><p class="tip">选两项。核对设备来源，以及同图何时已经出现。</p>
   ${placeCount()>=2?`<form id="deduction-form">${state.clues.filter(id=>definitions[id].location).map(id=>`<label class="evidence-option"><input type="checkbox" name="evidence" value="${id}"><span>${definitions[id].title}</span></label>`).join('')}<p id="deduction-error" class="error" role="status"></p><button class="primary wide" type="submit">核对推断</button></form>`:'<p class="tip">至少记录两份有关地点的材料后，再作判断。</p>'}`;
  return `<p class="section-label">调查 / 原始记录</p>${state.ending?'<button class="secondary wide" data-command="return-ending">回到本轮交接结果</button>':''}${evidence}<div class="deduction-panel">${question}</div>${hint()}`;
 }
 function ending(){
  const safe=state.ending==='safe',warned=state.handoffKnowledge==='verified';
  return `<article class="ending"><span class="ending-id">当夜交接 ${safe?'01 / 签收':'02 / 代收'}</span>
  <h3>${safe?'签收单':'车已经开走了'}</h3>
  ${safe?`<p>你拨通陈默的电话，报出青禾的地址。</p><blockquote>“我没叫人。你等一下，我出站就过去。”</blockquote>
  <p>23:59，店门响了一下。陈默站在门口收伞，裤脚湿到脚踝。是上次来取印件的人。</p>
  <p>他把对照稿摊在凳上，拿出手机看了看，又把两张标着原页的纸翻到背面。</p>
  <div class="dialogue"><p><span>陈默</span>“一共八张？”</p><p><span>你</span>“八张。”</p><p><span>陈默</span>“原页别折。我夹一下。”</p></div>
  <p>00:03，他在单上写下时间和名字。你把孟雪打印的凭证递过去，他指了指你的手机。</p>
  <blockquote>「你手机上那份留着。」</blockquote>
  <p>你问他联系上林遥没有。他摇头，把袋子放进包里，又拿起手机拨了一次。</p>
  <p>回到家，餐桌上的充电线还插着。你给林遥发了一条消息。</p><div class="bubble me"><span class="message-author">你 → 林遥</span>看到回电话，人先回来。</div>`:
  `<p>23:38，副驾车窗降了下来。你把纸袋递进去。</p>
  <p>司机在收件单上写了一个姓。你还没看清下面那一笔，他就把单子塞回袋里，搁到了后座。</p>
  ${warned?'<p>十一分钟后，陈默又打来。</p><blockquote>「你没给他吧？」</blockquote><p>你看着路边空出来的停车位，没有马上回答。</p>':'<p>十一分钟后，陈默打来电话。你告诉他，袋子已经给了司机。</p><blockquote>「哪个司机？我还在地铁上。没叫过车。」</blockquote>'}
  <p>陌生号码没人接。签过字的那张纸也在袋里。你翻了翻外套口袋，只有孟雪打印的寄存凭证。</p>`}
  <div class="divider"></div><p class="tip">第一幕停点 · 林遥去向仍待确认</p>
  <button class="primary wide" data-command="start-morning">继续 / 次日08:10的来电</button>
  <button class="secondary wide" data-command="reconsider">重看通知对象与交接选择</button>
  <button class="secondary wide" data-command="show-clues">回看材料</button>
  <p class="tip">候选版 v0.5.0-rc.1 · 实际浏览器验收待完成</p></article>`;
 }
 function render(){const later=state.morningStarted;document.querySelector('#story-time').textContent=later?(state.stage==='morning'?'10/26 08:10':'10/26 09:00'):'10/25 23:17';document.querySelector('#objective-title').innerHTML=later?'21:06记下了什么？<br>把人的行程与柜台操作分开。':'她说去了北站。<br>你能确定吗？';document.querySelector('#progress-label').textContent=later?'本单新材料 / 画面可选':'地点材料已记录';document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===state.tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});document.querySelector('#count').textContent=state.clues.length;document.querySelector('#progress').textContent=`${String(later?state.clues.filter(id=>Object.hasOwn(C2.clues,id)).length:placeCount()).padStart(2,'0')} / 03`;if(state.stage==='story'&&state.story){document.querySelector('#story-time').textContent=state.story.ending?'后续 / 尾声':SR.date(state.story,!!state.story.pending);document.querySelector('#objective-title').textContent=state.story.ending?'本轮结束，可回看选择':SR.model.nodes[state.story.index].id==='N06'?'你愿意参与到哪里？':'核对来源，再决定下一步';document.querySelector('#progress-label').textContent='本轮后续已确认选择';document.querySelector('#progress').textContent=String(state.story.log.length).padStart(2,'0');}screen.dataset.view=state.tab;screen.dataset.stage=state.stage;screen.innerHTML=({messages,album,notes,case:investigation})[state.tab]();save();}
 function go(stage){state.stage=stage;render();screen.scrollTop=0;screen.focus?.({preventScroll:true});}
 function captureCounterDraft(){
  if(state.stage!=='counter'||state.tab!=='case'||!state.counterVisited)return;
  state.counterDraft=R.normalizeCounterDraft(state,{
   event:document.querySelector('#counter-event').value,
   evidence:Array.from(screen.querySelectorAll('input[name="counter-evidence"]:checked'),x=>x.value),
   limit:document.querySelector('#counter-limit').value});
  save();
 }
 screen.addEventListener('change',e=>{if(e.target.closest('#counter-form'))captureCounterDraft();});
 document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;state.tab=b.dataset.tab;render();screen.scrollTop=0;});
 screen.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.command==='start-story'&&SR.eligible(state)){state.story=state.story||SR.begin(state);state.tab='case';go('story');return;}
  if(state.stage==='story'&&state.story){
   const run=state.story;
   if(b.dataset.storyChoice&&SR.choices(run).some(o=>o.id===b.dataset.storyChoice)){run.pending=b.dataset.storyChoice;render();screen.scrollTop=0;screen.focus?.({preventScroll:true});return;}
   if(b.dataset.storyCommand==='cancel'){run.pending=null;render();screen.scrollTop=0;screen.focus?.({preventScroll:true});return;}
   if(b.dataset.storyCommand==='confirm'&&run.pending){const updated=SR.commit(run,run.pending);if(updated){state.story=updated;render();screen.scrollTop=0;}return;}
   if(b.dataset.storyCommand==='review-start'){go('chapter2end');return;}
   if(b.dataset.storyRelationship&&run.ending&&['continue','bounded','distance'].includes(b.dataset.storyRelationship)){run.relationship=b.dataset.storyRelationship;render();return;}
   if(b.dataset.storyReplay!==undefined&&/^\d+$/.test(b.dataset.storyReplay)){const i=Number(b.dataset.storyReplay);if(i<run.log.length){storyReplayIndex=i;document.querySelector('#story-replay-dialog').showModal();}return;}
  }
  if(b.dataset.clue&&definitions[b.dataset.clue]&&R.canInspectClue(state,b.dataset.clue)){activeClue=b.dataset.clue;const d=definitions[activeClue];document.querySelector('#inspect-title').textContent=d.title;document.querySelector('#inspect-content').innerHTML=d.rows.map(([a,b])=>`<div class="detail-row"><span>${a}</span><b>${b}</b></div>`).join('');document.querySelector('#record').textContent=state.clues.includes(activeClue)?'已记录 · 返回':'记录材料';document.querySelector('#inspect').showModal();}
  if(b.dataset.location&&R.canVisitLocker(state)){if(b.dataset.location==='laundry')go('departure');else document.querySelector('#location-feedback').textContent=b.dataset.location==='station'?'这两份北站记录都不能确定当晚行程。还有哪份记录发生在今晚？':'目前没有当晚去住处的记录。再核对凭证。';}
  if(b.dataset.command==='call-chen'){state.contactVerified=true;render();notify('陈默说没有委托别人取件');}
  if(b.dataset.route&&state.stage==='departure'&&['chen','stranger'].includes(b.dataset.route)){state.departureCheckpoint=R.departureCheckpoint(state);state.departureRoute=b.dataset.route;state.ending=null;state.handoffKnowledge=null;state.lockerOpened=false;go('locker');}
  if(b.dataset.recipient&&state.stage==='handoff'){
   if(b.dataset.recipient==='chen')state.contactVerified=true;
   const result=R.completeHandoff(state,b.dataset.recipient);
   if(result){Object.assign(state,result);go('ending');}
  }
  if(b.dataset.command==='start-morning'&&R.canStartMorning(state)){state.morningStarted=true;go('morning');}
  if(b.dataset.morningQuestion&&state.stage==='morning'&&Object.hasOwn(C2.questionAnswers,b.dataset.morningQuestion)){
   if(!state.morningQuestions.includes(b.dataset.morningQuestion))state.morningQuestions.push(b.dataset.morningQuestion);
   const scroll=screen.scrollTop;render();screen.scrollTop=scroll;
  }
  if(b.dataset.command==='visit-counter'&&state.morningStarted&&R.canStartMorning(state)){state.counterVisited=true;go('counter');}
  if(b.dataset.videoChoice&&state.stage==='counter'&&state.counterVisited&&['view','skip'].includes(b.dataset.videoChoice)){
   state.videoChoice=b.dataset.videoChoice;
   if(state.videoChoice!=='view')state.clues=state.clues.filter(id=>id!=='camera');
   state.counterDraft=R.normalizeCounterDraft(state,state.counterDraft);
   const prior=state.counterConclusion;
   state.counterConclusion=prior?R.evaluateCounter(state,prior.event,prior.evidence,prior.limit):null;
   const scroll=screen.scrollTop;render();screen.scrollTop=scroll;
  }
  if(b.dataset.command==='request-night-replay'&&C2.isStage(state)&&R.canStartMorning(state))document.querySelector('#replay-dialog').showModal();
  if(b.dataset.command==='return-counter-result'&&state.counterConclusion)go('chapter2end');
  if(b.dataset.command==='review-counter'&&state.counterVisited&&!state.story)go('counter');
  if(b.dataset.command==='replay-morning'&&state.morningStarted&&!state.story)go('morning');
  if(b.dataset.command==='back'||b.dataset.command==='show-clues')go('investigate');
  if(b.dataset.command==='reconsider'){const replay=R.rewindToDeparture(state);if(replay){state=replay;render();screen.scrollTop=0;}}
  if(b.dataset.command==='return-ending'&&state.ending)go('ending');
  if(b.dataset.command==='hint'){const key=state.stage,level=state.hints[key]||0,scroll=screen.scrollTop;if(level<3){state.hints[key]=level+1;render();screen.scrollTop=scroll;}else notify('全部提示已展开');}
 });
 screen.addEventListener('submit',e=>{e.preventDefault();
  if(e.target.id==='story-proof-form'&&state.stage==='story'&&state.story?.pending){const answer=screen.querySelectorAll('input[name="story-proof"]:checked')[0]?.value;const updated=SR.commit(state.story,state.story.pending,answer);if(updated){state.story=updated;render();screen.scrollTop=0;}else document.querySelector('#story-proof-error').textContent='这项结论超出了所见来源。请对照材料与边界，再选一次。';return;}
  if(e.target.id==='deduction-form'){const selected=Array.from(screen.querySelectorAll('input[name="evidence"]:checked'),x=>x.value);if(R.evaluateDeduction(selected)){state.deduction=true;render();notify('推断已核实');}else document.querySelector('#deduction-error').textContent=selected.length!==2?'这次需要选择两份材料。':'再核对发送记录来自哪部设备，以及你2024年旧会话里的同一幅照片。';}
  if(e.target.id==='counter-form'&&state.stage==='counter'){
   captureCounterDraft();
   const selected=Array.from(screen.querySelectorAll('input[name="counter-evidence"]:checked'),x=>x.value);
   const event=document.querySelector('#counter-event').value,limit=document.querySelector('#counter-limit').value;
   const conclusion=R.evaluateCounter(state,event,selected,limit);
   if(conclusion){state.counterConclusion=conclusion;go('chapter2end');}
   else document.querySelector('#counter-error').textContent=event!=='stored'?'凭证写的是入柜操作。把人的到场与柜台的操作分开。':
    selected.length!==2?'请选两份已记录的材料，一份对应入柜，另一份对应此前的柜台暂存。':
    limit!=='custody-gap'?'这次没有连续看过暂存全过程，孟雪也没清点过袋内八张。哪一栏应留空？':
    '这两份材料没有连起两个步骤。电子凭证和店内操作行是同源记录；再核对柜台简记，或获准看过的片段。';
  }
  if(e.target.id==='code-form'){if(state.stage==='locker'&&state.departureRoute&&R.validCode(document.querySelector('#locker-code').value)){state.lockerOpened=true;go('handoff');}else document.querySelector('#code-error').textContent='柜门没开。可以回看旧会话，或逐步展开提示。';}
 });
 document.querySelector('#record').addEventListener('click',()=>{if(activeClue&&R.canInspectClue(state,activeClue)&&!state.clues.includes(activeClue)){state.clues.push(activeClue);notify('材料已记录');}document.querySelector('#inspect').close();render();});
 document.querySelector('#close-dialog').addEventListener('click',()=>document.querySelector('#inspect').close());
 document.querySelector('#cancel-replay').addEventListener('click',()=>document.querySelector('#replay-dialog').close());
 document.querySelector('#confirm-replay').addEventListener('click',()=>{
  const dialog=document.querySelector('#replay-dialog');
  if(!dialog.open)return;
  const replay=R.rewindToDeparture(state);
  dialog.close();
  if(replay){state=replay;render();screen.scrollTop=0;notify('已回到昨夜出门前');}
 });
 document.querySelector('#cancel-story-replay').addEventListener('click',()=>{storyReplayIndex=null;document.querySelector('#story-replay-dialog').close();});
 document.querySelector('#confirm-story-replay').addEventListener('click',()=>{const dialog=document.querySelector('#story-replay-dialog');if(!dialog.open||storyReplayIndex===null||!state.story)return;state.story=SR.rewind(state,state.story,storyReplayIndex);storyReplayIndex=null;dialog.close();go('story');});
 document.querySelector('#reset').addEventListener('click',()=>document.querySelector('#reset-dialog').showModal());
 document.querySelector('#cancel-reset').addEventListener('click',()=>document.querySelector('#reset-dialog').close());
 document.querySelector('#confirm-reset').addEventListener('click',()=>{state=R.initial();document.querySelector('#reset-dialog').close();render();screen.scrollTop=0;notify('调查已重新开始');});
 render();
})();

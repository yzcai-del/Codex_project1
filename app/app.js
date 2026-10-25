'use strict';
(() => {
 const R=globalThis.MidnightRules, KEY='after-hours-midnight-v02';
 const definitions={
  scheduled:{title:'消息发送记录',rows:[['发送时间','今天 23:17'],['发送方式','定时任务'],['任务建立','今天 19:02']],description:'北站消息在 23:17 发出；发送任务建立于 19:02。',location:true},
  photo:{title:'北站照片的文件信息',rows:[['文件名','IMG_20240516_1829.jpg'],['拍摄日期','2024 年 5 月 16 日'],['存入相册','今天 18:54']],description:'照片拍摄于 2024-05-16，今天 18:54 存入相册。',location:true},
  receipt:{title:'青禾洗衣电子凭证',rows:[['商户','青禾 24h 自助洗衣'],['交易时间','今天 21:06'],['项目','临时寄存'],['柜号','B17']],description:'今天 21:06 的凭证：青禾洗衣，临时寄存，柜号 B17。',location:true},
  promise:{title:'2021 年的一段会话',rows:[['日期','2021 年 11 月 02 日'],['你：修好了，明天拿给你。','23:16'],['林遥：行，晚安。','23:17']],description:'修手机那天，林遥在 23:17 说了晚安。',location:false},
  contact:{title:'一张未命名的便签',rows:[['修改时间','今天 18:36'],['接收人','陈默，档案组'],['补充','让他本人拿。收件凭证一并给他。']],description:'便签指定陈默本人取件，并要保留收件凭证。',location:false}
 };
 const hints={
  investigate:['先区分一条记录显示的时间，和它原本产生的时间。','检查北站消息的发送方式，再比较照片的拍摄日期与存入日期。','第一问选「消息发送记录」和「北站照片的文件信息」。随后用当日寄存凭证判断地点。'],
  locker:['便签里写了取码约定。再找找以前的会话。','林遥说「晚安」的时间值得留意。','输入 2317。'],
  handoff:['取件人的身份，手机里有没有约定？','再看未命名便签，留意“本人”两个字。','陈默是指定接收人，陌生号码的身份尚未核实。']
 };
 let state=R.initial(),activeClue=null,toastTimer;
 try{state=R.normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{}
 const screen=document.querySelector('#screen');
 const placeCount=()=>state.clues.filter(id=>definitions[id].location).length;
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
 const action=(id,label)=>`<button class="inspect-button" data-clue="${id}">${state.clues.includes(id)?'✓ 已记录 · ':''}${label}<small>检查记录</small></button>`;
 function notify(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
 function hint(){const key=state.stage,level=state.hints[key]||0;return `<div class="hint-box"><button class="secondary wide" data-command="hint">${level===3?'提示已全部展开':level?'再给一点提示':'需要一点提示'}</button><div aria-live="polite">${(hints[key]||[]).slice(0,level).map(t=>`<p class="tip">${t}</p>`).join('')}</div></div>`;}
 function messages(){return `<p class="section-label">消息 / 同步记录</p>
  <article class="thread"><div class="thread-head"><strong><span class="avatar">遥</span>林遥</strong><time>今天</time></div>
  <p>林遥把备用机留在你家充电，带着常用机下了楼。她的账号还登录在这台旧机上。</p>
  <div class="chat-time">21:12 · 发给你</div><div class="bubble">下楼买包烟。门别反锁。</div>
  <div class="chat-time">23:17 · 发给你</div><div class="bubble">到北站了。明早再说。</div>
  <p>你打了两次电话，都没人接。旧机上也同步了刚才的发送记录。</p>${action('scheduled','查看发送详情')}</article>
  <article class="thread"><div class="thread-head"><strong><span class="avatar">?</span>陌生号码</strong><time>23:16</time></div>
  <p>你好，我替陈老师拿点材料。林遥手机一直占线。你要是见到她，麻烦跟她说一声。</p></article>
  <article class="thread"><div class="thread-head"><strong>你与林遥</strong><time>2021</time></div>
  <p>旧会话停在修手机那天。后来你们换了账号，这一段没有迁过去。</p>${action('promise','翻看那天的聊天')}</article>
  <p class="tip">相册和便签也留在这台手机里。</p>`;}
 function album(){return `<p class="section-label">相册 / 最近存入</p>
  <article class="thread"><div class="thread-head"><strong>北站</strong><time>1 / 2</time></div>
  <div class="photo" role="img" aria-label="北站候车厅示意图，左下方有贴黄色胶带的行李箱"><div class="station-sign">北 站</div><div class="luggage" aria-hidden="true"></div><small>场景示意</small></div>
  <p>画面左下角有半只行李箱，拉杆贴着一圈黄胶带。林遥的箱子上也有。</p>${action('photo','查看文件信息')}</article>
  <article class="thread"><div class="thread-head"><strong>电子凭证</strong><time>2 / 2</time></div>
  <div class="receipt"><strong>青禾 24h</strong><br>自 助 洗 衣 · 临 时 寄 存<hr>DATE　今天 21:06<br>ITEM　寄存服务<br>BOX　 B17<hr>请保留凭证，取件时出示</div>${action('receipt','展开寄存凭证')}</article>`;}
 function notes(){return `<p class="section-label">便签 / 未命名</p>
  <article class="note"><h3>取件</h3>陈默，档案组。让他本人拿。<br>收件凭证别扔，他那边要留底。<br><br>柜码：修好旧手机那天，第一次说晚安的时间。<br>四位，不加冒号。${action('contact','记录接收人约定')}</article>
  <p class="tip">页脚显示，这张便签最后改于今天 18:36。</p>`;}
 function investigation(){
  if(state.stage==='ending')return ending();
  if(state.stage==='locker')return `<p class="section-label">青禾洗衣 / B17</p>
   <article class="note"><h3>柜门</h3>烘干机还在转。收银台没人，玻璃上贴着店主的电话。<br><br>B17 在最下面一排。你蹲下去，按亮了数字面板。</article>
   <form id="code-form"><label class="tip" for="locker-code">四位柜码</label><input id="locker-code" class="code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" aria-describedby="code-error" required placeholder="····"><p id="code-error" class="error" role="status"></p><button class="primary wide" type="submit">开柜</button></form>${hint()}<button class="secondary wide" data-command="back">返回调查</button>`;
  if(state.stage==='handoff')return `<p class="section-label">B17 / 文件袋</p>
   <article class="note"><h3>原件</h3>封口没粘。最上面是巡检表，几栏数字被蓝笔圈过，旁边写着另一份报告的页码。<br><br>袋里还有一张签收单。接收人一栏空着。</article>
   <p class="tip">陌生号码又发来消息：<br>「我让司机过去，车停路边，你把袋子给他就行。」</p><h3 class="question-title">你怎么交接？</h3>
   <button class="choice" data-recipient="chen">联系陈默，等他本人来取<small>保留文件袋和寄存凭证。</small></button>
   <button class="choice" data-recipient="courier">交给陌生号码安排的司机<small>让司机在签收单上留个名字。</small></button>${hint()}`;
  const evidence=state.clues.length?state.clues.map(id=>`<article class="evidence"><strong>${definitions[id].title}</strong><p>${definitions[id].description}</p></article>`).join(''):'<p class="empty">还没有记录。<br>先翻看手机里的内容。</p>';
  const question=state.deduction?`<p class="deduction-done">✓ 已核实：消息与照片都不能单独证明今晚的行程。</p>
   <h3 class="question-title">当晚的记录支持去哪里取件？</h3>
   ${state.clues.includes('receipt')?`<button class="choice" data-location="station">北站<small>23:17 消息提及的地点。</small></button><button class="choice" data-location="laundry">青禾洗衣店<small>寄存凭证上的商户。</small></button><button class="choice" data-location="home">林遥住处<small>通讯录中的家庭地址。</small></button><p id="location-feedback" class="error" role="status"></p>`:'<p class="tip">还需要一份当晚产生的记录。相册里是否还有别的材料？</p>'}`:
   `<h3 class="question-title">找出两份看似指向北站、却不能确认当晚行程的材料。</h3><p class="tip">选两项。比较记录产生的时间和显示的时间。</p>
   ${placeCount()>=2?`<form id="deduction-form">${state.clues.filter(id=>definitions[id].location).map(id=>`<label class="evidence-option"><input type="checkbox" name="evidence" value="${id}"><span>${definitions[id].title}</span></label>`).join('')}<p id="deduction-error" class="error" role="status"></p><button class="primary wide" type="submit">核对推断</button></form>`:'<p class="tip">至少记录两份有关地点的材料后，再作判断。</p>'}`;
  return `<p class="section-label">调查 / 原始记录</p>${evidence}<div class="deduction-panel">${question}</div>${hint()}`;
 }
 function ending(){const safe=state.ending==='safe';return `<article class="ending"><span class="ending-id">结局 ${safe?'01 / 签收':'02 / 代收'}</span><h3>${safe?'签收单':'车已经开走了'}</h3>
  ${safe?`<p>陈默到店时，裤脚湿了一截。他先报出林遥的工号，才伸手接文件袋。</p><p>翻到第三页，他把圈过的数字与手机里的一张表对了对。然后坐到塑料凳上，在签收单上写了名字。</p><blockquote>「凭证也给我。日期对得上。」</blockquote><p>你问林遥在哪儿。他摇了摇头，把文件放进包的内袋。<br><br>回到家，充电线还插着。你把门上的反锁拧开，给她留了灯。</p>`:
  `<p>司机没有下车。他降下副驾车窗，在签收单上写了个姓，把文件袋放到后座。车牌最后两位沾着泥。</p><p>十一分钟后，陈默打来电话。你提起司机，他在那边停了一会儿。</p><blockquote>「我还在地铁上。没叫过车。」</blockquote><p>你再拨刚才的号码，无人接听。洗衣店的玻璃门映着马路，车已经看不见了。<br><br>口袋里只剩那张寄存凭证，纸边被汗浸软了一角。</p>`}
  <div class="divider"></div><p class="tip">第一幕结束 · 林遥尚未归来</p><button class="primary wide" data-command="reconsider">回到交接之前</button><button class="secondary wide" data-command="show-clues">回看材料</button><p class="tip">v0.2.0 · 记录、推断与交接</p></article>`;}
 function render(){document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===state.tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});document.querySelector('#count').textContent=state.clues.length;document.querySelector('#progress').textContent=`${String(placeCount()).padStart(2,'0')} / 03`;screen.innerHTML=({messages,album,notes,case:investigation})[state.tab]();save();}
 function go(stage){state.stage=stage;render();screen.scrollTop=0;}
 document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;state.tab=b.dataset.tab;render();screen.scrollTop=0;});
 screen.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.clue){activeClue=b.dataset.clue;const d=definitions[activeClue];document.querySelector('#inspect-title').textContent=d.title;document.querySelector('#inspect-content').innerHTML=d.rows.map(([a,b])=>`<div class="detail-row"><span>${a}</span><b>${b}</b></div>`).join('');document.querySelector('#record').textContent=state.clues.includes(activeClue)?'已记录 · 返回':'记录材料';document.querySelector('#inspect').showModal();}
  if(b.dataset.location&&R.canVisitLocker(state)){if(b.dataset.location==='laundry')go('locker');else document.querySelector('#location-feedback').textContent=b.dataset.location==='station'?'这两份北站记录都不能确定当晚行程。还有哪份记录发生在今晚？':'目前没有当晚去住处的记录。再核对凭证。';}
  if(b.dataset.recipient&&state.stage==='handoff'){const result=R.endingFor(b.dataset.recipient);if(result){state.ending=result;go('ending');}}
  if(b.dataset.command==='back'||b.dataset.command==='show-clues')go('investigate');
  if(b.dataset.command==='reconsider')go('handoff');
  if(b.dataset.command==='hint'){const key=state.stage,level=state.hints[key]||0,scroll=screen.scrollTop;if(level<3){state.hints[key]=level+1;render();screen.scrollTop=scroll;}else notify('全部提示已展开');}
 });
 screen.addEventListener('submit',e=>{e.preventDefault();
  if(e.target.id==='deduction-form'){const selected=Array.from(screen.querySelectorAll('input[name="evidence"]:checked'),x=>x.value);if(R.evaluateDeduction(selected)){state.deduction=true;render();notify('推断已核实');}else document.querySelector('#deduction-error').textContent=selected.length!==2?'这次需要选择两份材料。':'再比较材料产生的时间。先不要把今天存入的照片，当成今天拍的照片。';}
  if(e.target.id==='code-form'){if(R.validCode(document.querySelector('#locker-code').value))go('handoff');else document.querySelector('#code-error').textContent='柜门没开。可以回看旧会话，或逐步展开提示。';}
 });
 document.querySelector('#record').addEventListener('click',()=>{if(activeClue&&!state.clues.includes(activeClue)){state.clues.push(activeClue);notify('材料已记录');}document.querySelector('#inspect').close();render();});
 document.querySelector('#close-dialog').addEventListener('click',()=>document.querySelector('#inspect').close());
 document.querySelector('#reset').addEventListener('click',()=>document.querySelector('#reset-dialog').showModal());
 document.querySelector('#cancel-reset').addEventListener('click',()=>document.querySelector('#reset-dialog').close());
 document.querySelector('#confirm-reset').addEventListener('click',()=>{state=R.initial();document.querySelector('#reset-dialog').close();render();screen.scrollTop=0;notify('调查已重新开始');});
 render();
})();

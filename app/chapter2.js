// Second-act views. Evidence here is what the player may read, not author truth.
(function(root){
 'use strict';
 const clues={
  cabinetLog:{title:'孟雪出示的本单操作行',rows:[['来源','孟雪同意展示的本单业务记录'],['柜号','B17'],['操作','10月25日21:06 入柜出票'],['操作人','孟雪'],['与电子凭证的关系','同一笔业务的店内记录']],description:'21:06是孟雪办理入柜的操作时间。这一行与旧机里的凭证同源。',location:false},
  counterNote:{title:'柜台暂存简记',rows:[['来源','孟雪自己的值班本，本单一行'],['原文','林，先存柜台；B17空出再转。'],['孟雪的说明','她傍晚交来的，我先放柜台里边。'],['时间边界','没有精确交袋分钟，也没有袋内清单']],description:'孟雪的简记与说明支持先交柜台、后转入B17；不保证暂存期间始终无人接触。',location:false},
  camera:{title:'获准查看的两段门店画面',rows:[['取得范围','孟雪同意本单相关两段，仅现场查看'],['傍晚片段','你认出林遥把纸袋递进柜台'],['夜间片段','孟雪从柜台内侧取纸袋，放入B17'],['不可读内容','袋内文字、页数与夹层均看不清'],['时间边界','画面时钟未经校准；中间时段未连续查看'],['留存','没有复制视频']],description:'你看过傍晚交袋与夜间移袋的有限片段；没有看过中间全过程，也看不清袋内内容。',location:false}
 };
 const questionAnswers={
  station:{label:'“北站那条短信，怎么回事？”',html:'<p>你把手机从耳边拿开，看了眼昨晚那条短信，又贴回去。</p><div class="dialogue"><p><span>你</span>“到北站了，是你发的？”</p><p><span>林遥</span>“我提前设的。昨晚没去北站。”</p><p><span>你</span>“那你后来为什么不取消？”</p><p><span>林遥</span>“我想拖到早上再说。对不起。”</p></div>'},
  where:{label:'“何宁是谁？你们昨晚在哪里？”',html:'<div class="dialogue"><p><span>林遥</span>“之前装订店何阿姨的女儿。她有些单子，我过去跟她一起理。”</p><p><span>你</span>“所以买烟也是随口说的？”</p><p><span>林遥</span>“嗯。后来就没回去。”</p></div><p>你把何宁的名字记下来。昨晚的去向，目前是林遥自己的说法。</p>'},
  silence:{label:'“工作号为什么一直不接？”',html:'<div class="dialogue"><p><span>林遥</span>“看见来电了。我把声音关了。”</p><p><span>你</span>“我问你人在哪里，袋子的事可以晚点说。”</p><p><span>林遥</span>“我知道。是我没回。”</p></div><p>电话那边有人拉开了椅子。林遥压低声音，问你九点半能不能见一面。</p>'}
 };
 const stages=['morning','counter','chapter2end'];
 const isStage=s=>s.morningStarted&&stages.includes(s.stage);
 const seen=(s,id)=>s.clues.includes(id);
 function morning(s){
  const custody=s.ending==='safe'
   ?'<p>你说袋子已经交给陈默，八张纸点过，单也签了。</p><blockquote>“好。等见面，我把借出来的那两页跟你说清楚。”</blockquote>'
   :'<p>你说袋子给了司机，陈默后来打来电话，说没有叫过车。</p><p>那边停了几秒。</p><blockquote>“我没让别人去拿。你把昨晚那个号码留着，先别删。”</blockquote>';
  return `<p class="section-label">第二幕 / 21:06</p>
   <article class="call-card"><span class="small-label">10月26日 · 08:10 / 林遥来电</span><h3>先回答你，人在哪里</h3>
   <p>你正找杯子，手机在桌上震起来。是她的工作号。</p>
   <div class="dialogue"><p><span>林遥</span>“袋子拿到了吗？”</p><p><span>你</span>“你人在哪？”</p><p><span>林遥</span>“何宁家。人没事。”</p></div>
   ${custody}<p class="tip">通话仍在继续。你可以直接问她去向和短信。</p></article>
   <h3 class="question-title">你还有话要问</h3>
   ${Object.entries(questionAnswers).map(([id,q])=>`<button class="choice" data-morning-question="${id}" ${s.morningQuestions.includes(id)?'disabled':''}>${q.label}${s.morningQuestions.includes(id)?'<small>已问过，原话留在下面。</small>':''}</button>`).join('')}
   ${s.morningQuestions.map(id=>`<article class="conversation-record">${questionAnswers[id].html}</article>`).join('')}
   <article class="note"><h3>青禾那张小票</h3>你把凭证压在杯子下面。21:06。那会儿林遥还在你家，九点十二才说下楼。<br><br>电话快挂断时，她与你约了九点半，地点稍后发。你先去青禾，问清这张单记的究竟是哪一步。</article>
   <button class="primary wide" data-command="visit-counter">09:00 / 带着凭证去青禾</button>
   <p class="tip">可以不问完就继续。已问过的对话保留在记录里。</p>`;
 }
 function counter(s,{action,hint}){
  const draft=s.counterDraft;
  const evidence=['receipt','cabinetLog','counterNote','camera'].filter(id=>seen(s,id));
  const options={receipt:'当晚收到的电子凭证',cabinetLog:clues.cabinetLog.title,counterNote:clues.counterNote.title,camera:clues.camera.title};
  return `<p class="section-label">10月26日 · 09:00 / 青禾柜台</p>
   <article class="counter-scene" role="img" aria-label="青禾早间柜台示意：值班本压着本单小票，其他客户记录未展示"><div class="desk-book">值班本<span>本单一行</span></div><div class="desk-slip">青禾 / B17<br><b>21:06</b><br>入柜操作</div><small>场景示意</small></article>
   <article class="note"><h3>她先看了你的单</h3>孟雪正把洗好的床单装进袋里。你等她打完结，把昨晚的小票递过去。<div class="dialogue"><p><span>你</span>“这张写九点零六。她是那会儿来的？”</p><p><span>孟雪</span>“晚上九点零六。我放进柜子的时间。”</p><p><span>你</span>“她交给你的时候呢？”</p><p><span>孟雪</span>“傍晚。柜子没空，我先放里边了。柜台有记。”</p></div></article>
   <article class="thread"><div class="thread-head"><strong>只核对你的这一单</strong><time>店主同意展示</time></div>
   <p>她把值班本翻过来，手掌压住旁边几行。</p>
   ${action('cabinetLog','查看B17的入柜操作行')}
   ${action('counterNote','查看柜台暂存那一行')}</article>
   <article class="thread"><div class="thread-head"><strong>门店画面</strong><time>可选</time></div>
   <blockquote>“要看我收袋子那段也行。就这两段，别的客人不看，也别录屏。”</blockquote>
   ${s.videoChoice==='view'?`<p>孟雪调出两段。傍晚那段，你认出林遥把纸袋递进柜台；夜间那段，孟雪从柜台内侧拿出纸袋，放进最下一排的柜子。</p><p class="tip">中间不是连续画面。画面上的时钟没有校准，袋内文字也看不清。</p>${action('camera','记录你获准看见的内容')}`:
   `<button class="secondary wide" data-video-choice="view">只看这单的两段，不复制</button><button class="secondary wide" data-video-choice="skip">先不看画面，核对业务单和简记</button>${s.videoChoice==='skip'?'<p class="tip">你没有查看视频。可以依据业务记录和孟雪的说明整理，结论要注明来源。</p>':''}`}</article>
   <article class="memory"><span class="small-label">昨夜你能确认的部分</span>${s.ending==='safe'?'<p>你取袋、清点，再交给陈默。孟雪没见证袋内八张纸的内容；那是你与陈默核对的。</p>':'<p>孟雪只记得你带着袋子走出店。她没看清车里的人，也没有司机姓名或车牌可补给你。签过姓的单子仍随袋离开。</p>'}</article>
   ${s.counterConclusion?'<button class="secondary wide" data-command="return-counter-result">返回已保存的核对结果</button>':''}<div class="deduction-panel"><h3 class="question-title">把这单的过程写清楚</h3>
   <p class="tip">先检查并记录材料。回看原始信息不会清除当前选择；电子凭证和店内操作行来自同一笔业务。</p>
   <form id="counter-form"><label class="field-label" for="counter-event">21:06对应哪一步？</label>
   <select id="counter-event" name="event" required><option value="">请选择</option><option value="arrival" ${draft.event==='arrival'?'selected':''}>林遥本人到店交袋</option><option value="stored" ${draft.event==='stored'?'selected':''}>孟雪将暂存袋转入柜并出票</option><option value="collected" ${draft.event==='collected'?'selected':''}>你从B17领取文件袋</option></select>
   <fieldset><legend>选两份能连起“先收柜台 → 后入柜”的材料</legend>
   ${evidence.map(id=>`<label class="evidence-option"><input type="checkbox" name="counter-evidence" value="${id}" ${draft.evidence.includes(id)?'checked':''}><span>${options[id]}</span></label>`).join('')}</fieldset>
   <label class="field-label" for="counter-limit">哪一栏仍不能填成“已经确认”？</label>
   <select id="counter-limit" name="limit" required><option value="">请选择</option><option value="box" ${draft.limit==='box'?'selected':''}>本单入的是哪只柜子</option><option value="custody-gap" ${draft.limit==='custody-gap'?'selected':''}>暂存全程无人接触，袋内未变</option><option value="safety" ${draft.limit==='safety'?'selected':''}>林遥现在是否已经主动报平安</option></select>
   <p id="counter-error" class="error" role="status"></p><button class="primary wide" type="submit">保存本次核对</button></form></div>${hint()}`;
 }
 function outcome(s){
  const camera=s.counterConclusion?.evidence.includes('camera');
  return `<article class="ending"><span class="ending-id">第二幕 / 本单核对完成</span><h3>柜台与柜子之间</h3>
   <div class="event-strip"><div><time>傍晚 / 分钟未定</time><b>林遥交袋，柜台暂存</b></div><div><time>21:06 / 业务记录</time><b>孟雪移入B17，出票</b></div><div><time>23:38 / 你的领取</time><b>取出纸袋，核对八张</b></div></div>
   <p>你在自己的笔记里补上一行：“21:06，孟雪入柜。”原凭证上的字没有动。</p>
   <p>${camera?'你在笔记旁写下：看过两段相关画面，没有复制；交袋与移袋之间，仍有没看过的时段。':'你在笔记旁写下：依据本单业务记录、暂存简记和孟雪的说明。没有把这次核对写成连续影像证明。'}</p>
   <p>你问她，柜台里边这段时间，袋子有没有被人动过。</p><blockquote>“我还要看机器、收衣服。没法一直盯着。”</blockquote>
   ${s.ending==='safe'?'<p>原页已经交给陈默。你给他发消息，说明小票上的21:06需要按入柜记录理解。</p>':'<p>你的笔记停在“带袋出店”之后。孟雪不能替你补上车里那段，你也没有那张签收单。</p>'}
   <p>离约好的时间还有一会儿。你把小票折回原来的折痕，林遥发来的见面地点压在通知栏上。</p>
   <div class="divider"></div><p class="tip">第二幕核对完成 / 继续会面、材料取证与后续选择。</p>
   <button class="primary wide" data-command="start-story">继续 / 09:30的会面与后续调查</button>
   ${s.story?'<p class="tip">后续进度已保存。继续按钮返回当前场景；若要改写昨夜交接，请使用下方带确认的入口。</p>':'<button class="secondary wide" data-command="review-counter">回看这次核对与材料</button><button class="secondary wide" data-command="replay-morning">回看08:10那通电话</button>'}
   <button class="secondary wide" data-command="request-night-replay">重选昨夜交接…</button>
   <p class="tip">候选版 v0.7.0-rc.3 / 真实浏览器验收待完成</p></article>`;
 }
 root.MidnightChapter2=Object.freeze({clues,questionAnswers,isStage,render:(s,helpers)=>s.stage==='morning'?morning(s):s.stage==='chapter2end'?outcome(s):counter(s,helpers)});
})(globalThis);

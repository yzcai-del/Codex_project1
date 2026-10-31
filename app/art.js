// Location artwork is atmosphere; source documents remain separately labelled.
(function(root){
 'use strict';
 const scenes={
  'home-night':{src:'assets/home-night.webp',title:'餐桌边的旧手机',alt:'深夜客厅，旧手机放在暖灯照着的餐桌上，窗外是冷蓝城市'},
  'laundry-night':{src:'assets/laundry-night.webp',title:'青禾的夜灯',alt:'雨后街边的洗衣店，暖灯、洗衣机和侧面的储物柜'},
  'meeting-morning':{src:'assets/meeting-morning.webp',title:'九点半的会面',alt:'日光下的社区会面室，三把椅子围着放有纸杯和封闭文件夹的木桌'},
  'factory-gate':{src:'assets/factory-gate.webp',title:'旧厂入口',alt:'从安全边界外看旧厂主楼和东侧通道，前方有普通隔离围挡'}
 };
 function figure(id,small=false){const a=scenes[id];return a?`<figure class="location-art ${small?'compact-art':''}"><button class="art-open" data-scene-image="${id}" aria-label="放大场景插画：${a.title}"><img src="${a.src}" alt="${a.alt}" width="1536" height="1024" decoding="async"><span>查看大图 ↗</span></button><figcaption><b>${a.title}</b><span>场景插画 · 不作为事件证据</span></figcaption></figure>`:'';}
 function current(s){
  if(s.stage==='story'&&s.story){if(s.story.ending)return s.story.ending==='E16'?'factory-gate':'meeting-morning';const id=root.MidnightStoryRules.model.nodes[s.story.index].id;return id==='N09'?'factory-gate':['N06','N08','N10','N11','N16','N17'].includes(id)?'meeting-morning':null;}
  if(['locker','handoff','ending'].includes(s.stage)&&!s.morningStarted)return 'laundry-night';
  if(!s.morningStarted)return 'home-night';return null;
 }
 root.MidnightArt=Object.freeze({scenes,figure,current});
})(globalThis);

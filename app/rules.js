// Shared by the browser and Node tests; no DOM or third-party dependencies.
(function (root) {
  'use strict';
  const idSet = new Set(['scheduled', 'photo', 'receipt', 'promise', 'contact']);
  const initial = () => ({tab:'messages', clues:[], stage:'investigate', ending:null, deduction:false, hints:{}});
  const normalize = (raw) => {
    const result=initial();
    if (!raw || typeof raw!=='object') return result;
    if (['messages','album','notes','case'].includes(raw.tab)) result.tab=raw.tab;
    if (Array.isArray(raw.clues)) result.clues=[...new Set(raw.clues.filter(id=>idSet.has(id)))];
    result.deduction=raw.deduction===true && ['scheduled','photo'].every(id=>result.clues.includes(id));
    if (['locker','handoff','ending'].includes(raw.stage) && result.deduction && result.clues.includes('receipt')) result.stage=raw.stage;
    if (['safe','lost'].includes(raw.ending)) result.ending=raw.ending;
    if (result.stage==='ending'&&!result.ending) result.stage='handoff';
    for(const key of ['investigate','locker','handoff']) result.hints[key]=Math.max(0,Math.min(3,Number.isFinite(raw.hints?.[key])?Math.floor(raw.hints[key]):0));
    return result;
  };
  const evaluateDeduction = (selected) => {
    const choices=[...new Set(selected)];
    return choices.length===2 && choices.includes('scheduled') && choices.includes('photo');
  };
  const canVisitLocker = state => state.deduction===true && state.clues.includes('receipt');
  const validCode = code => typeof code==='string' && /^\d{4}$/.test(code) && code==='2317';
  const endingFor = recipient => recipient==='chen'?'safe':recipient==='courier'?'lost':null;
  root.MidnightRules=Object.freeze({initial,normalize,evaluateDeduction,canVisitLocker,validCode,endingFor});
})(globalThis);

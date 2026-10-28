// Pure story rules shared by the browser and Node checks.
(function (root) {
  'use strict';
  const baseClues = ['scheduled', 'photo', 'receipt', 'promise', 'contact'];
  const laterClues = ['cabinetLog', 'counterNote', 'camera'];
  const clueIds = new Set([...baseClues, ...laterClues]);
  const initial = () => ({
    tab: 'messages', clues: [], stage: 'investigate', ending: null,
    deduction: false, hints: {}, departureRoute: null,
    contactVerified: false, lockerOpened: false, handoffKnowledge: null, departureCheckpoint: null,
    morningStarted: false, morningQuestions: [], counterVisited: false, videoChoice: null, counterConclusion: null
  });
  const canVisitLocker = s => s.deduction === true && s.clues.includes('receipt');
  const validCode = code => typeof code === 'string' && /^\d{4}$/.test(code) && code === '2317';
  const endingFor = recipient => recipient === 'chen' ? 'safe' : recipient === 'courier' ? 'lost' : null;
  const evaluateDeduction = selected => {
    if (!Array.isArray(selected)) return false;
    const values = [...new Set(selected)];
    return values.length === 2 && values.includes('scheduled') && values.includes('photo');
  };
  const canHandoff = (s, recipient) =>
    s.stage === 'handoff' && canVisitLocker(s) && s.lockerOpened === true &&
    ['chen', 'stranger'].includes(s.departureRoute) &&
    (recipient === 'chen' ? s.contactVerified === true :
      recipient === 'courier' && s.departureRoute === 'stranger');
  const completeHandoff = (s, recipient) => canHandoff(s, recipient) ? {
    ending: endingFor(recipient),
    handoffKnowledge: s.contactVerified ? 'verified' : 'unverified'
  } : null;
  const canStartMorning = s => ['safe','lost'].includes(s.ending) && s.lockerOpened === true && canVisitLocker(s);
  const canInspectClue = (s,id) => baseClues.includes(id) ||
    (s.counterVisited === true && (id === 'cabinetLog' || id === 'counterNote' ||
      (id === 'camera' && s.videoChoice === 'view')));
  const evaluateCounter = (s,event,evidence,limit) => {
    if (!s.counterVisited || event !== 'stored' || limit !== 'custody-gap' || !Array.isArray(evidence)) return null;
    const ids=[...new Set(evidence)];
    if (ids.length !== 2 || ids.some(id => !s.clues.includes(id) || !canInspectClue(s,id))) return null;
    if (!ids.some(id => ['receipt','cabinetLog'].includes(id)) ||
        !ids.some(id => ['counterNote','camera'].includes(id))) return null;
    return {event:'stored',evidence:ids,limit:'custody-gap'};
  };
  const departureCheckpoint = s => ({
    clues:s.clues.filter(id=>baseClues.includes(id)), contactVerified:s.contactVerified===true,
    hints:Object.fromEntries(['investigate','departure'].map(k=>[k,s.hints[k]||0]))
  });
  const rewindToDeparture = s => {
    if (!canStartMorning(s)) return null;
    const checkpoint=s.departureCheckpoint || {clues:s.clues.filter(id=>['scheduled','photo','receipt'].includes(id)),contactVerified:false,hints:{}};
    return {...initial(),tab:'case',stage:'departure',deduction:true,
      clues:[...checkpoint.clues],contactVerified:checkpoint.contactVerified,hints:{...checkpoint.hints}};
  };
  const normalize = raw => {
    const s = initial();
    if (!raw || typeof raw !== 'object') return s;
    if (['messages', 'album', 'notes', 'case'].includes(raw.tab)) s.tab = raw.tab;
    if (Array.isArray(raw.clues)) s.clues = [...new Set(raw.clues.filter(id => clueIds.has(id)))];
    s.contactVerified = raw.contactVerified === true;
    if (['chen', 'stranger'].includes(raw.departureRoute)) s.departureRoute = raw.departureRoute;
    s.deduction = raw.deduction === true && ['scheduled', 'photo'].every(id => s.clues.includes(id));
    s.lockerOpened = raw.lockerOpened === true && Boolean(s.departureRoute) && canVisitLocker(s);
    if (s.lockerOpened && ['verified', 'unverified'].includes(raw.handoffKnowledge))
      s.handoffKnowledge = raw.handoffKnowledge;
    if (s.lockerOpened && raw.ending === 'safe' && s.contactVerified && s.handoffKnowledge === 'verified')
      s.ending = 'safe';
    if (s.lockerOpened && raw.ending === 'lost' && s.departureRoute === 'stranger' && s.handoffKnowledge)
      s.ending = 'lost';
    if (canVisitLocker(s) && ['departure', 'locker', 'handoff', 'ending'].includes(raw.stage)) s.stage = raw.stage;
    if (s.stage !== 'investigate' && s.stage !== 'departure' && !s.departureRoute) s.stage = 'departure';
    if (['handoff', 'ending'].includes(s.stage) && !s.lockerOpened) s.stage = 'locker';
    if (s.stage === 'ending' && !s.ending) s.stage = 'handoff';
    const checkpoint=raw.departureCheckpoint;
    if (checkpoint && typeof checkpoint==='object' && Array.isArray(checkpoint.clues)) {
      const ids=[...new Set(checkpoint.clues.filter(id=>baseClues.includes(id)&&s.clues.includes(id)))];
      if (['scheduled','photo','receipt'].every(id=>ids.includes(id))) {
        s.departureCheckpoint={clues:ids,contactVerified:checkpoint.contactVerified===true&&s.contactVerified,
          hints:Object.fromEntries(['investigate','departure'].map(k=>{
            const v=checkpoint.hints?.[k];
            return [k,Number.isFinite(v)?Math.max(0,Math.min(3,Math.floor(v))):0];
          }))};
      }
    }
    s.morningStarted = raw.morningStarted === true && canStartMorning(s);
    if (s.morningStarted) {
      s.morningQuestions = Array.isArray(raw.morningQuestions) ?
        [...new Set(raw.morningQuestions.filter(id => ['station','where','silence'].includes(id)))] : [];
      s.counterVisited = raw.counterVisited === true;
      if (s.counterVisited && ['view','skip'].includes(raw.videoChoice)) s.videoChoice = raw.videoChoice;
    }
    s.clues = s.clues.filter(id => canInspectClue(s,id));
    if (raw.counterConclusion && typeof raw.counterConclusion === 'object')
      s.counterConclusion = evaluateCounter(s,raw.counterConclusion.event,raw.counterConclusion.evidence,raw.counterConclusion.limit);
    if (s.morningStarted && ['morning','counter','chapter2end'].includes(raw.stage)) {
      s.stage = raw.stage;
      if (s.stage !== 'morning' && !s.counterVisited) s.stage = 'morning';
      if (s.stage === 'chapter2end' && !s.counterConclusion) s.stage = 'counter';
    }
    for (const key of ['investigate', 'departure', 'locker', 'handoff', 'counter']) {
      const value = raw.hints?.[key];
      s.hints[key] = Number.isFinite(value) ? Math.max(0, Math.min(3, Math.floor(value))) : 0;
    }
    return s;
  };
  root.MidnightRules = Object.freeze({
    initial, normalize, evaluateDeduction, canVisitLocker, validCode, endingFor, canHandoff, completeHandoff, canStartMorning, canInspectClue, evaluateCounter, departureCheckpoint, rewindToDeparture
  });
})(globalThis);

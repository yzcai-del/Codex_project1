// Pure story rules shared by the browser and Node checks.
(function (root) {
  'use strict';
  const clueIds = new Set(['scheduled', 'photo', 'receipt', 'promise', 'contact']);
  const initial = () => ({
    tab: 'messages', clues: [], stage: 'investigate', ending: null,
    deduction: false, hints: {}, departureRoute: null,
    contactVerified: false, lockerOpened: false, handoffKnowledge: null
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
    for (const key of ['investigate', 'departure', 'locker', 'handoff']) {
      const value = raw.hints?.[key];
      s.hints[key] = Number.isFinite(value) ? Math.max(0, Math.min(3, Math.floor(value))) : 0;
    }
    return s;
  };
  root.MidnightRules = Object.freeze({
    initial, normalize, evaluateDeduction, canVisitLocker, validCode, endingFor, canHandoff, completeHandoff
  });
})(globalThis);

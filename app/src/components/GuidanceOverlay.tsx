import { useEffect, useState } from 'react';
import { phaseCopy, tips } from '../data/airportScenario';
import { PixelPerson } from './PixelPerson';
import type { Action, AppState, PhaseId } from '../types';

const nextPhase: Partial<Record<PhaseId, PhaseId>> = {
  landing: 'intro', intro: 'observe', observe: 'demoBoard', demoBoard: 'findFlight', findFlight: 'baggage', baggage: 'securityDemo', securityDemo: 'securityTip', securityTip: 'security', security: 'reduceGuidance', reduceGuidance: 'findGate', findGate: 'arrive', arrive: 'reflection', reflection: 'takeaways', takeaways: 'complete',
};
/* These beats play themselves. A phase the user must click through with
   nothing new to see is the kind of friction that makes a demo feel
   like a slideshow. */
const autoPhases: Partial<Record<PhaseId, number>> = {
  observe: 5200, demoBoard: 3600, baggage: 4600, securityDemo: 3600, arrive: 4200,
};
const companionStop: Partial<Record<PhaseId, number>> = {
  landing: 0, intro: 0, observe: 0, demoBoard: -4, findFlight: -5.4, baggage: -11, followPath: -15, securityDemo: -19, securityTip: -20, security: -21, reduceGuidance: -26, findGate: -33, arrive: -39.5, reflection: -39.5, takeaways: -39.5, complete: -39.5,
};

export function GuidanceOverlay({ state, dispatch, onReflect, sound }: { state: AppState; dispatch: React.Dispatch<Action>; onReflect: () => void; sound: { enabled: boolean; toggle: () => void } }) {
  const copy = phaseCopy[state.phase];
  const [tipOpen, setTipOpen] = useState(false);
  const tip = tips.find((item) => item.phase === state.phase);

  useEffect(() => { setTipOpen(state.phase === 'securityTip'); }, [state.phase]);
  useEffect(() => {
    const delay = autoPhases[state.phase];
    if (!delay) return;
    const timer = window.setTimeout(() => {
      const target = nextPhase[state.phase];
      if (target) dispatch({ type: 'ADVANCE', phase: target });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.phase]);
  useEffect(() => {
    if (!['findFlight', 'security', 'findGate'].includes(state.phase)) return;
    const timer = window.setTimeout(() => dispatch({ type: 'HINT' }), 7000);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.phase]);

  const advance = () => {
    const target = nextPhase[state.phase];
    if (target) dispatch({ type: 'ADVANCE', phase: target });
    else onReflect();
  };
  const openTip = (tipId: string) => { setTipOpen(true); dispatch({ type: 'OPEN_TIP', tipId }); };
  const clickSecurity = (item: string) => {
    dispatch({ type: 'EVENT', name: 'security_item_placed', payload: { item } });
    const placed = state.securityItemsPlaced.includes(item) ? state.securityItemsPlaced : [...state.securityItemsPlaced, item];
    if (placed.length >= 2) dispatch({ type: 'ADVANCE', phase: 'reduceGuidance' });
  };
  return <>
    <header className="topbar"><span>FIRST STEP</span><span className="topbar-right">01 / 第一次坐飞机</span><button className="sound-toggle" onClick={sound.toggle} aria-pressed={sound.enabled}>{sound.enabled ? '声音 开' : '声音 关'}</button></header>
    <main className="overlay-content">      <section className="guidance-panel">
        <p className="eyebrow italic">{copy.en}</p>
        <h1>{copy.zh.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h1>
        {state.hintLevel > 0 && copy.hint && <p className="hint">{copy.hint}</p>}
        {state.phase === 'intro' && <button className="primary-button" onClick={advance}>我准备好了 <span>→</span></button>}
        {state.phase === 'findFlight' && <p className="scene-hint">点击信息屏上高亮的 <strong>FS001</strong></p>}
        {state.phase === 'baggage' && tip && <aside className="tip-card is-center"><p className="eyebrow italic">{tip.en}</p><h2>{tip.title}</h2><p>{tip.body}</p></aside>}
        {state.phase === 'securityTip' && <button className="tip-link" onClick={() => { dispatch({ type: 'OPEN_TIP', tipId: 'security-prep' }); dispatch({ type: 'ADVANCE', phase: 'security' }); }}>知道了，继续 <span>ⓘ</span></button>}
        {state.phase === 'security' && <div className="object-actions"><button onClick={() => clickSecurity('phone')}>手机</button><button onClick={() => clickSecurity('bag')}>随身包</button></div>}
        {state.phase === 'reduceGuidance' && <button className="text-action" onClick={advance}>我准备好了 <span>→</span></button>}
        {state.phase === 'findGate' && <p className="scene-hint">这一次没有指引。<span>试着找到 18 号登机口。</span></p>}
        {state.phase === 'arrive' && <button className="text-action" onClick={advance}>继续 <span>→</span></button>}
        {state.phase === 'reflection' && <button className="text-action" onClick={onReflect}>查看这次旅程 <span>→</span></button>}
      </section>
      {state.phase === 'takeaways' && <section className="reflection-panel"><p className="eyebrow italic">{copy.en}</p><h1>{copy.zh}</h1><div className="takeaways"><p><span>01</span>先看航班信息屏，再寻找登机口。</p><p><span>02</span>托运行李前，确认票价是否包含行李额度。</p><p><span>03</span>把容易取出的物品放在行李外层。</p></div><button className="primary-button" onClick={advance}>完成这次探索 <span>→</span></button></section>}
      {state.phase === 'complete' && <section className="reflection-panel"><p className="eyebrow italic">{copy.en}</p><h1>{copy.zh}</h1><button className="primary-button" onClick={() => dispatch({ type: 'RESET' })}>再次探索 <span>↗</span></button></section>}
    </main>
    <PixelPerson className="companion-badge" gender={state.avatarId} label="这是你" />
    {tipOpen && tip && <aside className="tip-card"><button className="close-tip" onClick={() => setTipOpen(false)}>×</button><p className="eyebrow italic">{tip.en}</p><h2>{tip.title}</h2><p>{tip.body}</p><button className="primary-button small" onClick={() => setTipOpen(false)}>知道了，继续</button></aside>}
  </>;
}

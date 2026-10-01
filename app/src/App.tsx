import { useEffect, useReducer, useRef, useState } from 'react';
import { AvatarPicker } from './components/AvatarPicker';
import { GuidanceOverlay } from './components/GuidanceOverlay';
import { LandingCover } from './components/LandingCover';
import { ScenarioLibrary } from './components/ScenarioLibrary';
import { StarfieldBackdrop } from './components/StarfieldBackdrop';
import { ExperienceCanvas } from './experience/ExperienceCanvas';
import { companionStop } from './experience/TerminalScene';
import { useSoundscape } from './experience/useSoundscape';
import { getReflection, type Reflection } from './reflection';
import { initialState, reducer, summaryFrom } from './state/experienceReducer';
import './styles/global.css';
import './styles/tokens.css';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [atLibrary, setAtLibrary] = useState(false);
  const phaseRef = useRef(companionStop.landing);
  const sound = useSoundscape(state.phase);

  useEffect(() => { phaseRef.current = companionStop[state.phase] ?? companionStop.landing; }, [state.phase]);

  const showReflection = async () => {
    dispatch({ type: 'ADVANCE', phase: 'reflection' });
    setReflectionLoading(true);
    const result = await getReflection(summaryFrom(state));
    setReflection(result);
    setReflectionLoading(false);
  };

  const reset = () => { setReflection(null); setAtLibrary(false); dispatch({ type: 'RESET' }); };
  const effectivePhase = reflection ? 'reflection' : state.phase;
  const viewState = effectivePhase === state.phase ? state : { ...state, phase: effectivePhase };
  const atCover = state.phase === 'landing' && !reflection && !atLibrary;
  const inWorld = !atCover && !atLibrary && state.phase !== 'avatar';

  const startExperience = () => { setAtLibrary(false); dispatch({ type: 'ADVANCE', phase: 'avatar' }); };
  const selectFlight = () => {
    if (state.phase !== 'findFlight') return;
    dispatch({ type: 'EVENT', name: 'flight_found' });
    dispatch({ type: 'EVENT', name: 'first_action' });
    dispatch({ type: 'ADVANCE', phase: 'baggage' });
  };
  const selectGate = () => {
    if (state.phase !== 'findGate') return;
    dispatch({ type: 'EVENT', name: 'gate_found' });
    dispatch({ type: 'ADVANCE', phase: 'arrive' });
  };

  return <div className={`app-shell phase-${viewState.phase}`}>
    {inWorld && <div className="world-layer"><ExperienceCanvas state={viewState} onSelectFlight={selectFlight} onSelectGate={selectGate} phaseRef={phaseRef} /></div>}
    {inWorld && <div className="world-wash" />}
    {atCover && <LandingCover onEnter={() => setAtLibrary(true)} />}
    {atLibrary && <ScenarioLibrary onEnter={startExperience} onBack={() => setAtLibrary(false)} />}
    {!atCover && !atLibrary && <>
      {state.phase === 'avatar' ? <>
        <StarfieldBackdrop />
        <p className="handwritten-note">Every journey begins with one step.</p>
        <header className="topbar"><span>FIRST STEP</span><span className="topbar-right">01 / 第一次坐飞机</span></header>
        <AvatarPicker selected={state.avatarId} onSelect={(id) => dispatch({ type: 'SELECT_AVATAR', avatarId: id })} onConfirm={() => dispatch({ type: 'ADVANCE', phase: 'intro' })} />
      </> : <GuidanceOverlay state={viewState} dispatch={dispatch} onReflect={showReflection} sound={sound} />}
      {reflectionLoading && <div className="reflection-loading"><span className="loading-dot" />正在整理这次旅程…</div>}
      {reflection && !reflectionLoading && <aside className="ai-note"><p className="eyebrow italic">A NOTE FROM YOUR JOURNEY</p><h2>{reflection.observation}</h2><p>{reflection.meaning}</p><p className="closing-line">{reflection.closingLine}</p><span className="source-chip">{reflection.source === 'ai' ? 'AI 生成' : 'FIRST STEP'}</span></aside>}
      {reflection && !reflectionLoading && <div className="reflection-actions"><button className="primary-button small" onClick={reset}>再次探索 <span>↗</span></button></div>}
    </>}
  </div>;
}

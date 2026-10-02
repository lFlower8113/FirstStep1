import { useEffect, useReducer, useRef, useState } from 'react';
import { AvatarPicker } from './components/AvatarPicker';
import { GuidanceOverlay } from './components/GuidanceOverlay';
import { LandingCover } from './components/LandingCover';
import { ScenarioLibrary } from './components/ScenarioLibrary';
import { PackingStage } from './components/PackingStage';
import { FinaleStage } from './components/FinaleStage';
import { StarfieldBackdrop } from './components/StarfieldBackdrop';
import { ExperienceCanvas, useLookInput } from './experience/ExperienceCanvas';
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
  const freeLook = state.phase === 'arrival' || state.phase === 'lookAround';
  const { input: lookRef, dragging } = useLookInput(state.phase === 'lookAround');

  useEffect(() => { phaseRef.current = companionStop[state.phase] ?? companionStop.landing; }, [state.phase]);

  const showReflection = async () => {
    dispatch({ type: 'ADVANCE', phase: 'reflection' });
    setReflectionLoading(true);
    const result = await getReflection(summaryFrom(state));
    setReflection(result);
    setReflectionLoading(false);
  };

  const reset = () => { setReflection(null); setAtLibrary(false); dispatch({ type: 'RESET' }); };
  const atCover = state.phase === 'landing' && !atLibrary;
  const atPacking = state.phase === 'packing' || state.phase === 'packingList';
  const atFinale = ['arrive', 'reflection', 'takeaways', 'complete'].includes(state.phase);
  const inWorld = !atCover && !atLibrary && !atPacking && state.phase !== 'avatar' && !atFinale;

  const startExperience = () => { setAtLibrary(false); dispatch({ type: 'ADVANCE', phase: 'avatar' }); };
  const selectFlight = () => {
    if (state.phase !== 'findFlight') return;
    dispatch({ type: 'EVENT', name: 'first_action' });
    dispatch({ type: 'EVENT', name: 'flight_found' });
    dispatch({ type: 'ADVANCE', phase: 'goCounter' });
  };
  const selectCounter = () => {
    if (state.phase !== 'goCounter') return;
    dispatch({ type: 'EVENT', name: 'counter_found' });
    dispatch({ type: 'ADVANCE', phase: 'baggage' });
  };
  const selectGate = () => {
    if (state.phase !== 'findGate') return;
    dispatch({ type: 'EVENT', name: 'gate_found' });
    dispatch({ type: 'ADVANCE', phase: 'board' });
  };

  return <div className={`app-shell phase-${state.phase} ${freeLook ? 'is-free-look' : ''} ${dragging ? 'is-dragging' : ''}`}>
    {inWorld && <div className="world-layer"><ExperienceCanvas state={state} onSelectFlight={selectFlight} onSelectGate={selectGate} onSelectCounter={selectCounter} phaseRef={phaseRef} lookRef={lookRef} /></div>}
    {inWorld && <div className="world-wash" />}
    {atCover && <LandingCover onEnter={() => setAtLibrary(true)} />}
    {atLibrary && <ScenarioLibrary onEnter={startExperience} onBack={() => setAtLibrary(false)} />}
    {atPacking && <><StarfieldBackdrop /><PackingStage state={state} dispatch={dispatch} /></>}
    {atFinale && <><StarfieldBackdrop /><FinaleStage state={state} dispatch={dispatch} reflection={reflection} reflectionLoading={reflectionLoading} onReflect={showReflection} onReset={reset} /></>}
    {!atCover && !atLibrary && !atPacking && !atFinale && <>
      {state.phase === 'avatar' ? <>
        <StarfieldBackdrop />
        <p className="handwritten-note">Every journey begins with one step.</p>
        <header className="topbar"><span>FIRST STEP</span><span className="topbar-right">01 / 第一次坐飞机</span></header>
        <AvatarPicker selected={state.avatarId} onSelect={(id) => dispatch({ type: 'SELECT_AVATAR', avatarId: id })} onConfirm={() => dispatch({ type: 'ADVANCE', phase: 'packing' })} />
      </> : <GuidanceOverlay state={state} dispatch={dispatch} onReflect={showReflection} reflection={reflection} reflectionLoading={reflectionLoading} sound={sound} onCounter={selectCounter} onReset={reset} />}
    </>}
  </div>;
}

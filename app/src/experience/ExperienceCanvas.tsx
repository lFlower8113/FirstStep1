import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type { AppState } from '../types';
import { Companion, TerminalScene, focusByPhase, type PhaseProgress } from './TerminalScene';

const FOG_COLOR = '#101823';
const NEAR_FAR = { start: 62, arrive: 96 };
const ARRIVAL_PHASES = ['arrive', 'reflection', 'takeaways', 'complete'];

function Rig({ state, phaseRef }: { state: AppState; phaseRef: { current: PhaseProgress } }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.8, -40));
  const fog = useRef<THREE.Fog | null>(null);
  const lastPhase = useRef<string>('');

  useFrame((_, delta) => {
    const ease = 1 - Math.pow(0.0022, delta);
    const focus = focusByPhase[state.phase];
    const arriving = ARRIVAL_PHASES.includes(state.phase);
    const behind = phaseRef.current.z + 5.4;

    if (lastPhase.current !== state.phase) {
      lastPhase.current = state.phase;
      if (focus) look.current.copy(focus);
    }
    const targetLook = arriving
      ? new THREE.Vector3(0, 1.9, -60)
      : focus ?? new THREE.Vector3(0, 1.8, behind - 26);
    camera.position.lerp(new THREE.Vector3(0.5, 1.72, behind), ease);
    look.current.lerp(targetLook, ease);
    camera.lookAt(look.current);
    if (fog.current) fog.current.far = THREE.MathUtils.lerp(fog.current.far, arriving ? NEAR_FAR.arrive : NEAR_FAR.start, ease);
  });

  return <fog ref={fog} attach="fog" args={[FOG_COLOR, 12, NEAR_FAR.start]} />;
}

function Beacon({ state }: { state: AppState }) {
  const mesh = useRef<THREE.Mesh>(null);
  const focus = focusByPhase[state.phase];
  const hidden = !focus || ['reduceGuidance', 'findGate', 'arrive', 'complete'].includes(state.phase);
  useFrame(({ clock }) => { if (mesh.current) mesh.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.08); });
  if (hidden || !focus) return null;
  return <group>
    <mesh ref={mesh} position={focus}><ringGeometry args={[0.5, 0.62, 48]} /><meshBasicMaterial color="#f5bd87" transparent opacity={0.85} toneMapped={false} /></mesh>
    <pointLight position={focus} color="#f5bd87" intensity={7} distance={12} />
  </group>;
}

export function ExperienceCanvas({ state, onSelectFlight, onSelectGate, phaseRef }: {
  state: AppState;
  onSelectFlight: () => void;
  onSelectGate: () => void;
  phaseRef: { current: PhaseProgress };
}) {
  const flightHighlighted = state.phase === 'demoBoard' || state.phase === 'findFlight' || state.flightAttempts > 0;
  const gateLit = state.phase === 'findGate' || state.phase === 'arrive' || state.gateFoundWithoutDirectHighlight;
  const dpr = useMemo<[number, number]>(() => [1, Math.min(2, window.devicePixelRatio || 1)], []);

  return <Canvas camera={{ position: [0.5, 1.72, 5.4], fov: 62, near: 0.1, far: 200 }} dpr={dpr} gl={{ antialias: true }}>
    <color attach="background" args={[FOG_COLOR]} />
    <Rig state={state} phaseRef={phaseRef} />
    <ambientLight intensity={0.86} color="#b9cbe2" />
    <hemisphereLight args={['#e2eeff', '#2a3546', 1.05]} />
    <directionalLight position={[10, 18, 6]} intensity={0.9} color="#dce8fa" />
    <directionalLight position={[-10, 16, -30]} intensity={0.5} color="#c8d8ef" />
    <pointLight position={[0, 10.5, -14]} color="#f2f7ff" intensity={70} distance={54} decay={1.4} />
    <pointLight position={[0, 10.5, -34]} color="#f2f7ff" intensity={70} distance={54} decay={1.4} />
    <pointLight position={[0, 10.5, -54]} color="#f2f7ff" intensity={60} distance={50} decay={1.4} />
    <pointLight position={[0, 6, -46]} color="#ffd9b0" intensity={30} distance={26} />
    <TerminalScene state={state} flightHighlighted={flightHighlighted} gateLit={gateLit} onSelectFlight={onSelectFlight} onSelectGate={onSelectGate} />
    <Companion avatarId={state.avatarId} phaseRef={phaseRef} />
    <Beacon state={state} />
    <Sparkles count={140} scale={[24, 9, 80]} size={1.5} speed={0.12} color="#c8d6ea" opacity={0.2} />
  </Canvas>;
}

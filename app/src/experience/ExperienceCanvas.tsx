import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type { AppState } from '../types';
import { Companion, TerminalScene, focusByPhase, type PhaseProgress } from './TerminalScene';
import type { PhaseId } from '../types';

const FOG_COLOR = '#233246';
const NEAR_FAR = { start: 78, arrive: 120 };
const FREE_LOOK = ['arrival', 'lookAround'];

export const cameraPosByPhase: Partial<Record<PhaseId, THREE.Vector3>> = {
  arrival: new THREE.Vector3(0.5, 1.72, 2.2),
  lookAround: new THREE.Vector3(0.5, 1.72, 2.2),
  observe: new THREE.Vector3(0.5, 1.72, 0.5),
  demoBoard: new THREE.Vector3(-3.2, 2.2, -3.2),
  findFlight: new THREE.Vector3(-3.2, 2.2, -3.2),
  goCounter: new THREE.Vector3(-6.8, 1.65, -13.5),
  baggage: new THREE.Vector3(-6.8, 1.65, -13.5),
  followPath: new THREE.Vector3(0, 1.7, -16.5),
  securityDemo: new THREE.Vector3(1.2, 1.65, -20.5),
  securityTip: new THREE.Vector3(1.2, 1.65, -20.5),
  security: new THREE.Vector3(1.2, 1.65, -20.5),
  reduceGuidance: new THREE.Vector3(0, 1.72, -26),
  waitGate: new THREE.Vector3(0, 1.75, -33),
  findGate: new THREE.Vector3(0, 1.8, -37.5),
  board: new THREE.Vector3(0, 1.8, -42),
};

export type LookInput = { yaw: number; pitch: number; active: boolean };

export const fovByPhase: Partial<Record<PhaseId, number>> = {
  arrival: 62,
  lookAround: 62,
  observe: 60,
  demoBoard: 55,
  findFlight: 55,
  goCounter: 56,
  baggage: 56,
  followPath: 60,
  securityDemo: 54,
  securityTip: 54,
  security: 54,
  reduceGuidance: 60,
  waitGate: 58,
  findGate: 55,
  board: 56,
};

/* Critically damped harmonic oscillator for silky-smooth camera dolly without abrupt starts */
function smoothDampVec3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  velocity: THREE.Vector3,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): void {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let changeX = current.x - target.x;
  let changeY = current.y - target.y;
  let changeZ = current.z - target.z;

  const maxChange = maxSpeed * smoothTime;
  const maxChangeSq = maxChange * maxChange;
  const sqDist = changeX * changeX + changeY * changeY + changeZ * changeZ;

  if (sqDist > maxChangeSq) {
    const scale = maxChange / Math.sqrt(sqDist);
    changeX *= scale;
    changeY *= scale;
    changeZ *= scale;
  }

  const origTargetX = target.x;
  const origTargetY = target.y;
  const origTargetZ = target.z;

  const toX = current.x - changeX;
  const toY = current.y - changeY;
  const toZ = current.z - changeZ;

  const tempX = (velocity.x + omega * changeX) * deltaTime;
  const tempY = (velocity.y + omega * changeY) * deltaTime;
  const tempZ = (velocity.z + omega * changeZ) * deltaTime;

  velocity.x = (velocity.x - omega * tempX) * exp;
  velocity.y = (velocity.y - omega * tempY) * exp;
  velocity.z = (velocity.z - omega * tempZ) * exp;

  let outX = toX + (changeX + tempX) * exp;
  let outY = toY + (changeY + tempY) * exp;
  let outZ = toZ + (changeZ + tempZ) * exp;

  if ((origTargetX - current.x > 0) === (outX > origTargetX)) {
    outX = origTargetX;
    velocity.x = 0;
  }
  if ((origTargetY - current.y > 0) === (outY > origTargetY)) {
    outY = origTargetY;
    velocity.y = 0;
  }
  if ((origTargetZ - current.z > 0) === (outZ > origTargetZ)) {
    outZ = origTargetZ;
    velocity.z = 0;
  }

  current.x = outX;
  current.y = outY;
  current.z = outZ;
}

/* A slow establishing sweep, then dynamic camera positioning per milestone. */
function Rig({ state, lookRef }: { state: AppState; lookRef: { current: LookInput } }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.8, -40));
  const camVel = useRef(new THREE.Vector3(0, 0, 0));
  const lookVel = useRef(new THREE.Vector3(0, 0, 0));
  const fog = useRef<THREE.Fog | null>(null);
  const lastPhase = useRef<string>('');
  const sweep = useRef(0);
  const initialized = useRef(false);

  useFrame(({ clock }, delta) => {
    // Clamp delta to prevent jerky jumps on mobile frame drops or background tabs
    const dt = Math.min(delta, 0.05);
    const focus = focusByPhase[state.phase];
    const targetCameraPos = cameraPosByPhase[state.phase] ?? new THREE.Vector3(0.5, 1.72, 2.2);
    const free = FREE_LOOK.includes(state.phase);
    const behind = targetCameraPos.z;

    if (!initialized.current) {
      initialized.current = true;
      camera.position.copy(targetCameraPos);
      if (focus) look.current.copy(focus);
      lastPhase.current = state.phase;
    } else if (lastPhase.current !== state.phase) {
      lastPhase.current = state.phase;
      if (state.phase === 'lookAround') sweep.current = 0;
    }

    let targetLook: THREE.Vector3;
    if (free) {
      if (state.phase === 'arrival') {
        sweep.current = Math.min(1, sweep.current + dt * 0.12);
        const t = sweep.current;
        const angle = -0.55 + t * 1.1;
        const radius = 26;
        targetLook = new THREE.Vector3(Math.sin(angle) * radius, 3.4 + Math.sin(t * Math.PI) * 1.2, behind - Math.cos(angle) * radius);
      } else {
        const input = lookRef.current;
        const radius = 24;
        targetLook = new THREE.Vector3(targetCameraPos.x + Math.sin(input.yaw) * radius, targetCameraPos.y + 0.8 + input.pitch * 7, behind - Math.cos(input.yaw) * radius);
      }
    } else {
      targetLook = focus ?? new THREE.Vector3(0, 1.8, -30);
    }

    // 1. Silky SmoothDamp for camera translation (zero jerk at start, graceful cruise, cushioned stop)
    smoothDampVec3(camera.position, targetCameraPos, camVel.current, 0.82, 18, dt);

    // 2. SmoothDamp for camera gaze (orienting smoothly; faster on interactive drag, filmic on guidance)
    const lookSmoothTime = free && lookRef.current.active ? 0.12 : 0.62;
    smoothDampVec3(look.current, targetLook, lookVel.current, lookSmoothTime, 24, dt);

    // 3. Subtle steadicam breathing / organic presence
    const breatheY = Math.sin(clock.elapsedTime * 1.4) * 0.006;
    const breatheX = Math.cos(clock.elapsedTime * 0.9) * 0.004;

    camera.position.y += breatheY;
    camera.position.x += breatheX;
    camera.lookAt(look.current);
    camera.position.y -= breatheY;
    camera.position.x -= breatheX;

    // 4. Dynamic cinematic FOV (dolly-zoom feel)
    const targetFov = fovByPhase[state.phase] ?? 60;
    const persCamera = camera as THREE.PerspectiveCamera;
    if (persCamera.isPerspectiveCamera) {
      persCamera.fov = THREE.MathUtils.damp(persCamera.fov, targetFov, 2.5, dt);
      persCamera.updateProjectionMatrix();
    }

    // 5. Dynamic fog distance
    if (fog.current) {
      const targetFar = state.phase === 'board' || state.phase === 'arrive' ? NEAR_FAR.arrive : NEAR_FAR.start;
      fog.current.far = THREE.MathUtils.damp(fog.current.far, targetFar, 1.8, dt);
    }
  });

  return <fog ref={fog} attach="fog" args={[FOG_COLOR, 12, NEAR_FAR.start]} />;
}

/* Pointer capture lives in the DOM layer; the 3D rig only reads it. */
export function useLookInput(enabled: boolean) {
  const input = useRef<LookInput>({ yaw: 0, pitch: 0, active: false });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!enabled) { input.current.active = false; setDragging(false); return; }
    let lastX = 0;
    let lastY = 0;
    const onDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('button, a, input, .guidance-panel, .packing-stage, .tip-card, .boarding-pass-card')) {
        return;
      }
      input.current.active = true;
      lastX = event.clientX; lastY = event.clientY;
      setDragging(true);
    };
    const onMove = (event: PointerEvent) => {
      if (!input.current.active) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX; lastY = event.clientY;
      input.current.yaw = Math.max(-0.9, Math.min(0.9, input.current.yaw - dx * 0.0024));
      input.current.pitch = Math.max(-0.25, Math.min(0.35, input.current.pitch - dy * 0.0016));
    };
    const onUp = () => { input.current.active = false; setDragging(false); };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled]);

  return { input, dragging };
}

function Beacon({ state }: { state: AppState }) {
  const focus = focusByPhase[state.phase];
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((stateFrame) => {
    if (!ringRef.current) return;
    const t = (stateFrame.clock.getElapsedTime() * 1.6) % 1;
    ringRef.current.scale.setScalar(1 + t * 0.85);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    if (mat) mat.opacity = (1 - t) * 0.45;
  });

  if (!focus) return null;

  return <group position={[focus.x, 0.08, focus.z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.44, 32]} />
      <meshBasicMaterial color="#f5bd87" transparent opacity={0.65} side={THREE.DoubleSide} />
    </mesh>
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial color="#f5bd87" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
    <pointLight position={focus} color="#f5bd87" intensity={7} distance={12} />
  </group>;
}

export function ExperienceCanvas({ state, onSelectFlight, onSelectGate, onSelectCounter, phaseRef, lookRef }: {
  state: AppState;
  onSelectFlight: () => void;
  onSelectGate: () => void;
  onSelectCounter: () => void;
  phaseRef: { current: PhaseProgress };
  lookRef: { current: LookInput };
}) {
  const flightHighlighted = state.phase === 'demoBoard' || state.phase === 'findFlight' || state.flightAttempts > 0;
  const gateLit = state.phase === 'findGate' || state.phase === 'arrive' || state.gateFoundWithoutDirectHighlight;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 680;
  const dpr = useMemo<[number, number]>(() => [1, isMobile ? 1.5 : Math.min(2, window.devicePixelRatio || 1)], [isMobile]);

  return <Canvas camera={{ position: [0.5, 1.72, 2.2], fov: 62, near: 0.1, far: 200 }} dpr={dpr} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={[FOG_COLOR]} />
    <Rig state={state} lookRef={lookRef} />

    {/* Sky & natural ambient daylight */}
    <ambientLight intensity={1.15} color="#e5effa" />
    <hemisphereLight args={['#d6e8fc', '#ffeacc', 1.25]} />

    {/* Sunny daylight streaming in from terminal windows */}
    <directionalLight position={[18, 22, 10]} intensity={1.3} color="#fff6e8" />
    <directionalLight position={[-18, 20, -25]} intensity={0.8} color="#dbeaff" />

    {/* Warm downlights over terminal hall entrance, check-in, security and gate */}
    <pointLight position={[0, 9.8, 0]} color="#ffe8cc" intensity={60} distance={42} decay={1.3} />
    <pointLight position={[-5, 9.5, -14]} color="#ffdca8" intensity={75} distance={44} decay={1.3} />
    <pointLight position={[2, 9.5, -23]} color="#ffe5bf" intensity={70} distance={44} decay={1.3} />
    <pointLight position={[0, 9.8, -34]} color="#ffe0b2" intensity={65} distance={44} decay={1.3} />
    <pointLight position={[0, 6.2, -45.5]} color="#ffcf96" intensity={40} distance={28} />
    <TerminalScene state={state} flightHighlighted={flightHighlighted} gateLit={gateLit} onSelectFlight={onSelectFlight} onSelectGate={onSelectGate} onSelectCounter={onSelectCounter} />
    <Companion avatarId={state.avatarId} phaseRef={phaseRef} />
    <Beacon state={state} />
    <Sparkles count={isMobile ? 55 : 140} scale={[24, 9, 80]} size={1.5} speed={0.12} color="#c8d6ea" opacity={0.2} />
  </Canvas>;
}

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { palettes, spriteCanvas, walkOrder, frameOrder, type SpriteGender } from '../data/pixelSprites';
import type { AppState, PhaseId } from '../types';

export type PhaseProgress = { z: number; walking: boolean };

/* ─────────────────────────────────────────────────────────────
   Coordinate contract
   Landmarks are authored at the coordinates the phase system uses,
   so the guidance ring, the beacon and the camera always land on a
   real object. Moving a landmark means editing focusByPhase in the
   same change.
   ───────────────────────────────────────────────────────────── */

export const focusByPhase: Partial<Record<PhaseId, THREE.Vector3>> = {
  observe: new THREE.Vector3(-5.4, 3.6, -8),
  demoBoard: new THREE.Vector3(-5.4, 3.6, -8),
  findFlight: new THREE.Vector3(-5.4, 3.6, -8),
  baggage: new THREE.Vector3(5.8, 1.5, -14),
  followPath: new THREE.Vector3(0, 0.4, -17),
  securityDemo: new THREE.Vector3(3.4, 1.6, -24),
  securityTip: new THREE.Vector3(3.4, 1.6, -24),
  security: new THREE.Vector3(3.4, 1.6, -24),
  reduceGuidance: new THREE.Vector3(0, 1.2, -30),
  findGate: new THREE.Vector3(0, 2.4, -46),
  arrive: new THREE.Vector3(0, 2.4, -46),
};

export const companionStop: Record<PhaseId, PhaseProgress> = {
  landing: { z: 0, walking: false },
  avatar: { z: 0, walking: false },
  intro: { z: 0, walking: false },
  observe: { z: 0, walking: false },
  demoBoard: { z: -4, walking: true },
  findFlight: { z: -5.4, walking: false },
  baggage: { z: -11, walking: true },
  followPath: { z: -17, walking: true },
  securityDemo: { z: -21, walking: true },
  securityTip: { z: -22, walking: false },
  security: { z: -22, walking: false },
  reduceGuidance: { z: -29, walking: true },
  findGate: { z: -37, walking: true },
  arrive: { z: -44, walking: true },
  reflection: { z: -44, walking: false },
  takeaways: { z: -44, walking: false },
  complete: { z: -44, walking: false },
};

const HALL = { length: 108, width: 30, height: 12 };
const MID_Z = -HALL.length / 2 + 20;

/* ── flight board ─────────────────────────────────────────── */

function useFlightBoardTexture(highlighted: boolean) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    ctx.fillStyle = '#0a1018'; ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = 'rgba(140,170,210,0.09)';
    for (let y = 0; y < 512; y += 4) ctx.fillRect(0, y, 1024, 1);
    ctx.font = '600 24px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(180,200,228,0.55)';
    ctx.fillText('FLIGHT     ROUTE          TIME     GATE     STATUS', 44, 60);
    const rows = [
      { code: 'FS001', route: '北京 → 上海', time: '09:40', gate: '18', state: 'BOARDING', target: true },
      { code: 'FS208', route: '北京 → 首尔', time: '10:15', gate: '04', state: 'ON TIME', target: false },
      { code: 'FS316', route: '北京 → 东京', time: '11:20', gate: '22', state: 'ON TIME', target: false },
    ];
    rows.forEach((row, index) => {
      const y = 146 + index * 106;
      const active = row.target && highlighted;
      ctx.fillStyle = active ? 'rgba(245,189,135,0.2)' : 'rgba(255,255,255,0.035)';
      ctx.fillRect(28, y - 44, 968, 82);
      if (row.target) {
        ctx.strokeStyle = active ? 'rgba(245,189,135,0.95)' : 'rgba(245,189,135,0.34)';
        ctx.lineWidth = active ? 3 : 1.4;
        ctx.strokeRect(28, y - 44, 968, 82);
      }
      ctx.font = '600 40px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = row.target ? '#ffd6ae' : 'rgba(226,234,248,0.62)';
      ctx.fillText(row.code, 48, y);
      ctx.font = '400 30px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = 'rgba(214,224,240,0.66)';
      ctx.fillText(row.route, 262, y);
      ctx.fillText(row.time, 588, y);
      ctx.fillText(row.gate, 748, y);
      ctx.fillStyle = active ? '#f5bd87' : 'rgba(170,190,220,0.45)';
      ctx.fillText(row.state, 872, y);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [highlighted]);
}

function FlightBoard({ highlighted, onSelect }: { highlighted: boolean; onSelect: () => void }) {
  const texture = useFlightBoardTexture(highlighted);
  return <group position={[-6.2, 4.1, -8]}>
    <mesh><boxGeometry args={[11.4, 5.7, 0.36]} /><meshStandardMaterial color="#1b2432" roughness={0.46} metalness={0.4} /></mesh>
    <mesh position={[0, 0, 0.21]}><planeGeometry args={[10.9, 5.2]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <mesh position={[0, 0, 0.45]} onClick={onSelect}><planeGeometry args={[10.9, 5.2]} /><meshBasicMaterial transparent opacity={0} /></mesh>
    <mesh position={[0, -3.4, 0]}>
      <boxGeometry args={[0.4, 1, 0.4]} />
      <meshStandardMaterial color="#2a3543" />
    </mesh>
  </group>;
}

/* ── overhead wayfinding ──────────────────────────────────── */

function useWayfindingTexture(rows: { arrow: 'up' | 'left' | 'right'; cn: string; en: string }[]) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    ctx.fillStyle = 'rgba(10,16,25,0.97)'; ctx.fillRect(0, 0, 768, 256);
    ctx.strokeStyle = 'rgba(190,206,232,0.22)'; ctx.lineWidth = 3; ctx.strokeRect(6, 6, 756, 244);

    const arrow = (kind: 'up' | 'left' | 'right', cx: number, cy: number, size: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      if (kind === 'up') { ctx.moveTo(cx, cy - size); ctx.lineTo(cx + size * 0.72, cy + size * 0.5); ctx.lineTo(cx - size * 0.72, cy + size * 0.5); }
      if (kind === 'left') { ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size * 0.5, cy - size * 0.72); ctx.lineTo(cx + size * 0.5, cy + size * 0.72); }
      if (kind === 'right') { ctx.moveTo(cx + size, cy); ctx.lineTo(cx - size * 0.5, cy - size * 0.72); ctx.lineTo(cx - size * 0.5, cy + size * 0.72); }
      ctx.closePath(); ctx.fill();
    };

    const slot = 768 / rows.length;
    rows.forEach((row, index) => {
      const cx = slot * index + slot / 2;
      if (index > 0) { ctx.fillStyle = 'rgba(190,206,232,0.18)'; ctx.fillRect(slot * index, 26, 2, 204); }
      arrow(row.arrow, cx, 62, 22, '#f5bd87');
      ctx.textAlign = 'center';
      ctx.font = '500 44px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#e9eefa'; ctx.fillText(row.cn, cx, 150);
      ctx.font = '400 22px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = 'rgba(190,206,232,0.62)'; ctx.fillText(row.en.toUpperCase(), cx, 196);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [rows]);
}

function WayfindingSign({ position, width, rows }: { position: [number, number, number]; width: number; rows: { arrow: 'up' | 'left' | 'right'; cn: string; en: string }[] }) {
  const texture = useWayfindingTexture(rows);
  const height = (width * 256) / 768;
  return <group position={position}>
    <mesh><boxGeometry args={[width + 0.12, height + 0.12, 0.12]} /><meshStandardMaterial color="#232e3d" roughness={0.6} metalness={0.32} /></mesh>
    <mesh position={[0, 0, 0.08]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, height / 2 + 0.9, 0]}><boxGeometry args={[0.1, 1.8, 0.1]} /><meshStandardMaterial color="#2a3543" /></mesh>
  </group>;
}

/* ── check-in island ──────────────────────────────────────── */

function useCounterTexture(number: string, status: 'open' | 'busy' | 'closed') {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    ctx.fillStyle = 'rgba(12,18,28,0.96)'; ctx.fillRect(0, 0, 256, 128);
    const label = status === 'open' ? '办理中' : status === 'busy' ? '排队较长' : '暂停服务';
    const color = status === 'open' ? '#7fe0a8' : status === 'busy' ? '#f5bd87' : '#8b98ab';
    ctx.textAlign = 'center';
    ctx.font = '600 62px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#eef3fb'; ctx.fillText(number, 128, 68);
    ctx.font = '500 26px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = color; ctx.fillText(label, 128, 106);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [number, status]);
}

function CounterUnit({ number, status, position }: { number: string; status: 'open' | 'busy' | 'closed'; position: [number, number, number] }) {
  const texture = useCounterTexture(number, status);
  return <group position={position}>
    <mesh position={[0, 0.55, 0]}><boxGeometry args={[2.7, 1.1, 2.5]} /><meshStandardMaterial color="#46536a" roughness={0.62} metalness={0.18} /></mesh>
    <mesh position={[0, 1.17, 0]}><boxGeometry args={[2.8, 0.08, 2.6]} /><meshStandardMaterial color="#e2ddd2" roughness={0.36} /></mesh>
    <mesh position={[0, 1.95, -1.1]}><boxGeometry args={[1.3, 0.72, 0.08]} /><meshStandardMaterial color="#131c28" emissive="#22334a" emissiveIntensity={0.9} /></mesh>
    <mesh position={[0, 1.95, -1.02]}><planeGeometry args={[1.24, 0.66]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <mesh position={[0, 2.62, -1.1]}><boxGeometry args={[0.09, 0.7, 0.09]} /><meshStandardMaterial color="#2f3a49" /></mesh>
  </group>;
}

function CheckInCounters() {
  return <group>
    <mesh position={[-9.4, 3.5, -21]}><boxGeometry args={[0.4, 0.5, 14]} /><meshStandardMaterial color="#2a3543" /></mesh>
    <mesh position={[-9.4, 4.7, -21]}><planeGeometry args={[4.6, 0.66]} /><meshBasicMaterial color="#f5bd87" transparent opacity={0.55} toneMapped={false} /></mesh>
    <CounterUnit number="A01" status="open" position={[-9.4, 0, -17]} />
    <CounterUnit number="A02" status="busy" position={[-9.4, 0, -20.8]} />
    <CounterUnit number="A03" status="open" position={[-9.4, 0, -24.6]} />
    <CounterUnit number="A04" status="closed" position={[-9.4, 0, -28.4]} />
  </group>;
}

/* ── baggage scale ────────────────────────────────────────── */

function BaggageScale() {
  return <group position={[5.8, 0, -14]}>
    <mesh position={[0, 0.5, 0]}><boxGeometry args={[2, 1, 1.6]} /><meshStandardMaterial color="#4a5768" roughness={0.56} metalness={0.28} /></mesh>
    <mesh position={[0, 1.02, 0]}><boxGeometry args={[1.6, 0.06, 1.2]} /><meshStandardMaterial color="#ddd7cb" roughness={0.36} /></mesh>
    <mesh position={[0, 0.86, 0.8]}><planeGeometry args={[0.72, 0.3]} /><meshStandardMaterial color="#131c28" emissive="#f5bd87" emissiveIntensity={0.6} /></mesh>
  </group>;
}

/* ── security lane ────────────────────────────────────────── */

function SecurityLane({ itemsPlaced }: { itemsPlaced: number }) {
  return <group position={[3.4, 0, -24]}>
    {[-1.6, 1.6].map((x) => <mesh key={x} position={[x, 1.4, 0]}><boxGeometry args={[0.34, 2.8, 0.34]} /><meshStandardMaterial color="#4a5668" roughness={0.52} metalness={0.42} /></mesh>)}
    <mesh position={[0, 2.84, 0]}><boxGeometry args={[3.5, 0.3, 0.34]} /><meshStandardMaterial color="#4a5668" roughness={0.52} metalness={0.42} /></mesh>
    <mesh position={[0, 0.45, -0.1]}><boxGeometry args={[3.5, 0.16, 1.6]} /><meshStandardMaterial color="#454f5c" metalness={0.58} roughness={0.36} /></mesh>
    {[-1.3, -0.65, 0, 0.65, 1.3].map((x) => <mesh key={x} position={[x, 0.57, -0.1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 1.5, 10]} /><meshStandardMaterial color="#6a7686" metalness={0.72} roughness={0.26} /></mesh>)}
    <mesh position={[0, 0.68, 0.5]} visible={itemsPlaced > 0}><boxGeometry args={[1.6, 0.14, 1.05]} /><meshStandardMaterial color="#dbe3ee" roughness={0.3} metalness={0.14} /></mesh>
    <mesh position={[-1.6, 0.82, 1]} visible={itemsPlaced < 1}><boxGeometry args={[0.26, 0.05, 0.44]} /><meshStandardMaterial color="#3b4653" emissive="#55677f" emissiveIntensity={0.8} /></mesh>
    <mesh position={[-0.9, 0.86, 1]} visible={itemsPlaced < 2}><boxGeometry args={[0.66, 0.32, 0.36]} /><meshStandardMaterial color="#6b5343" roughness={0.72} /></mesh>
  </group>;
}

/* ── rule board: stable, airline-agnostic guidance ────────── */

function RuleBoard() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    ctx.fillStyle = 'rgba(12,18,28,0.95)'; ctx.fillRect(0, 0, 640, 320);
    ctx.strokeStyle = 'rgba(190,206,232,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(6, 6, 628, 308);
    ctx.textAlign = 'left';
    ctx.font = '500 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#f5bd87'; ctx.fillText('出发前请留意', 42, 66);
    ctx.font = '400 27px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(226,234,248,0.85)';
    ctx.fillText('停止办理值机　起飞前 40 分钟', 42, 128);
    ctx.fillText('关闭登机口　　起飞前 20 分钟', 42, 178);
    ctx.fillText('托运行李　　　按航司与票价规定', 42, 228);
    ctx.font = '400 20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(170,184,204,0.72)';
    ctx.fillText('具体以航司与机场现场规定为准', 42, 278);
    const created = new THREE.CanvasTexture(canvas);
    created.colorSpace = THREE.SRGBColorSpace;
    return created;
  }, []);
  return <group position={[9.6, 2.7, -12]}>
    <mesh position={[0, -1, 0]}><boxGeometry args={[0.12, 2, 0.12]} /><meshStandardMaterial color="#2a3543" /></mesh>
    <mesh><boxGeometry args={[3.1, 1.6, 0.14]} /><meshStandardMaterial color="#1b2432" roughness={0.5} metalness={0.3} /></mesh>
    <mesh position={[0, 0, 0.09]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[3, 1.5]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
  </group>;
}

/* ── gate side ────────────────────────────────────────────── */

function GateBoard({ found }: { found: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    ctx.fillStyle = 'rgba(10,16,25,0.96)'; ctx.fillRect(0, 0, 768, 256);
    ctx.textAlign = 'left';
    ctx.font = '600 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(190,206,232,0.62)';
    ctx.fillText('GATE 18', 44, 62);
    ctx.font = '600 54px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#ffd6ae'; ctx.fillText('FS001', 44, 132);
    ctx.font = '400 32px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(226,234,248,0.8)'; ctx.fillText('北京 → 上海   09:40', 44, 186);
    ctx.textAlign = 'right';
    ctx.font = '600 40px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = found ? '#7fe0a8' : '#f5bd87';
    ctx.fillText(found ? '已找到' : '登机中', 724, 132);
    ctx.font = '400 24px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(190,206,232,0.55)';
    ctx.fillText('BOARDING', 724, 182);
    const created = new THREE.CanvasTexture(canvas);
    created.colorSpace = THREE.SRGBColorSpace;
    return created;
  }, [found]);
  return <group position={[0, 3.5, -44.6]}>
    <mesh><boxGeometry args={[4.8, 1.7, 0.18]} /><meshStandardMaterial color="#1b2432" roughness={0.48} metalness={0.32} /></mesh>
    <mesh position={[0, 0, 0.11]}><planeGeometry args={[4.6, 1.5]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
  </group>;
}

function GatePortal({ onSelect, lit }: { onSelect: () => void; lit: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    ctx.fillStyle = 'rgba(10,16,25,0.96)'; ctx.fillRect(0, 0, 640, 240);
    ctx.strokeStyle = 'rgba(190,206,232,0.24)'; ctx.lineWidth = 3; ctx.strokeRect(8, 8, 624, 224);
    ctx.textAlign = 'center';
    ctx.font = '500 70px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#eaf0fb'; ctx.fillText('18 号登机口', 320, 118);
    ctx.font = '400 32px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(245,189,135,0.88)'; ctx.fillText('GATE 18 · BOARDING', 320, 176);
    const created = new THREE.CanvasTexture(canvas);
    created.colorSpace = THREE.SRGBColorSpace;
    return created;
  }, []);
  return <group position={[0, 0, -46]}>
    <mesh position={[0, 5.1, 0]}><boxGeometry args={[7.6, 0.5, 0.5]} /><meshStandardMaterial color="#3d4a5c" roughness={0.58} metalness={0.32} /></mesh>
    <mesh position={[0, 3.5, 0.12]}><planeGeometry args={[4.2, 1.58]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    {[-3.5, 3.5].map((x) => <mesh key={x} position={[x, 2.5, 0]}><boxGeometry args={[0.42, 5, 0.42]} /><meshStandardMaterial color="#445065" /></mesh>)}
    <mesh position={[0, 2.4, -1.4]}><planeGeometry args={[6, 4.8]} /><meshBasicMaterial color={lit ? '#f5bd87' : '#3d4a5c'} transparent opacity={lit ? 0.32 : 0.16} /></mesh>
    <mesh position={[0, 2.4, -1.3]} onClick={onSelect}><planeGeometry args={[6.4, 5.2]} /><meshBasicMaterial transparent opacity={0} /></mesh>
    {lit && <pointLight position={[0, 2.4, -0.6]} color="#f5bd87" intensity={12} distance={20} />}
  </group>;
}

function SeatingRows() {
  const seats = useMemo(() => {
    const list: { x: number; z: number }[] = [];
    for (let z = -33; z > -HALL.length + 20; z -= 5.6) list.push({ x: -6.6, z }, { x: 6.6, z });
    return list;
  }, []);
  return <group>{seats.map((seat, index) => <group key={index} position={[seat.x, 0, seat.z]}>
    <mesh position={[0, 0.24, 0]}><boxGeometry args={[1.8, 0.16, 0.95]} /><meshStandardMaterial color="#4d5a6d" roughness={0.7} /></mesh>
    <mesh position={[0, 0.56, -0.36]}><boxGeometry args={[1.8, 0.64, 0.14]} /><meshStandardMaterial color="#4d5a6d" roughness={0.7} /></mesh>
  </group>)}</group>;
}

/* ── shell ────────────────────────────────────────────────── */

function Ceiling() {
  const trusses = useMemo(() => {
    const list: number[] = [];
    for (let z = 10; z > -HALL.length + 26; z -= 5) list.push(z);
    return list;
  }, []);
  return <group>
    <mesh position={[0, 0, MID_Z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[HALL.width / 2, HALL.width / 2, HALL.length, 48, 1, true]} />
      <meshStandardMaterial color="#2a3646" side={THREE.BackSide} roughness={0.9} metalness={0.08} />
    </mesh>
    {trusses.map((z) => <mesh key={z} position={[0, HALL.height - 1.4, z]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[HALL.width / 2 - 0.5, 0.16, 6, 40, Math.PI]} />
      <meshStandardMaterial color="#2f3d4f" roughness={0.6} metalness={0.44} />
    </mesh>)}
    {[-1, 1].map((side) => <mesh key={side} position={[side * 4.4, HALL.height - 1.9, MID_Z]}>
      <boxGeometry args={[0.34, 0.16, HALL.length * 0.94]} />
      <meshStandardMaterial color="#f4f8ff" emissive="#e8f0ff" emissiveIntensity={2.6} toneMapped={false} />
    </mesh>)}
    <mesh position={[0, HALL.height - 0.6, MID_Z]}>
      <boxGeometry args={[HALL.width * 0.46, 0.1, HALL.length * 0.94]} />
      <meshStandardMaterial color="#2b3849" emissive="#3a4c66" emissiveIntensity={1.1} />
    </mesh>
  </group>;
}

function WindowBands() {
  const panels = useMemo(() => {
    const list: number[] = [];
    for (let z = 8; z > -HALL.length + 26; z -= 9) list.push(z);
    return list;
  }, []);
  return <group>{[-1, 1].map((side) => <group key={side}>
    {panels.map((z) => <mesh key={z} position={[side * (HALL.width / 2 - 0.2), 4.4, z]} rotation={[0, side * -Math.PI / 2, 0]}>
      <planeGeometry args={[7.6, 7.2]} />
      <meshStandardMaterial color="#9fc4ea" emissive="#bcd8f6" emissiveIntensity={1.5} transparent opacity={0.5} roughness={0.1} metalness={0.4} />
    </mesh>)}
  </group>)}</group>;
}

function Columns() {
  const items = useMemo(() => {
    const list: { x: number; z: number }[] = [];
    for (let z = 8; z > -HALL.length + 24; z -= 8) list.push({ x: -9.6, z }, { x: 9.6, z });
    return list;
  }, []);
  return <group>{items.map((item, index) => <group key={index} position={[item.x, 0, item.z]}>
    <mesh position={[0, 5, 0]}><cylinderGeometry args={[0.34, 0.48, 10, 14]} /><meshStandardMaterial color="#414e61" roughness={0.56} metalness={0.3} /></mesh>
    <mesh position={[0, 10, 0]}><boxGeometry args={[1.7, 0.22, 1.7]} /><meshStandardMaterial color="#39465a" roughness={0.68} /></mesh>
  </group>)}</group>;
}

function GlassWalls() {
  return <group>{[-1, 1].map((side) => <mesh key={side} position={[side * (HALL.width / 2 + 1.4), 5, MID_Z]}>
    <planeGeometry args={[HALL.length * 0.92, 9.4]} />
    <meshStandardMaterial color="#182c44" emissive="#2a4a6e" emissiveIntensity={0.4} transparent opacity={0.22} roughness={0.12} metalness={0.5} side={THREE.DoubleSide} />
  </mesh>)}</group>;
}

function Lightboxes() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    const gradient = ctx.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, '#3d6ea8'); gradient.addColorStop(0.5, '#7fa8d8'); gradient.addColorStop(1, '#d8a87f');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.textAlign = 'center';
    ctx.font = '600 52px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('出发', 256, 118);
    ctx.font = '400 26px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('DEPARTURES', 256, 168);
    const created = new THREE.CanvasTexture(canvas);
    created.colorSpace = THREE.SRGBColorSpace;
    return created;
  }, []);
  return <group>
    {[-1, 1].map((side) => [0, 1, 2].map((index) => <mesh key={`${side}-${index}`} position={[side * (HALL.width / 2 - 0.7), 3.4, -18 - index * 16]} rotation={[0, side * -Math.PI / 2, 0]}>
      <planeGeometry args={[4.6, 2.3]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>))}
  </group>;
}

function TerminalName() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    ctx.clearRect(0, 0, 1024, 200);
    ctx.textAlign = 'center';
    ctx.font = '500 78px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#eef4ff';
    ctx.fillText('首都机场 T3 航站楼', 512, 92);
    ctx.font = '300 32px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(190,206,232,0.72)';
    ctx.fillText('CAPITAL INTERNATIONAL AIRPORT · TERMINAL 3', 512, 148);
    const created = new THREE.CanvasTexture(canvas);
    created.colorSpace = THREE.SRGBColorSpace;
    return created;
  }, []);
  return <mesh position={[0, 6.6, -HALL.length + 22]}>
    <planeGeometry args={[24, 4.7]} />
    <meshBasicMaterial map={texture} transparent toneMapped={false} />
  </mesh>;
}

/* ── crowd ────────────────────────────────────────────────── */

const CROWD_CLOTHING = ['#c8d2de', '#d8c9b8', '#a8bcd0', '#e0d6cc', '#b4c0cc', '#cdbfae', '#9fb0c4'];
const CROWD_SKIN = ['#f0d0b2', '#e2bb98', '#c99a76', '#f5ddc4'];

function Traveler({ index, position }: { index: number; position: [number, number, number] }) {
  const cloth = CROWD_CLOTHING[index % CROWD_CLOTHING.length];
  const skin = CROWD_SKIN[index % CROWD_SKIN.length];
  const bag = index % 3 === 0;
  return <group position={position} scale={0.94 + (index % 5) * 0.03}>
    <mesh position={[0, 0.82, 0]}><capsuleGeometry args={[0.21, 0.86, 6, 14]} /><meshStandardMaterial color={cloth} roughness={0.82} /></mesh>
    <mesh position={[0, 1.52, 0]}><sphereGeometry args={[0.22, 16, 16]} /><meshStandardMaterial color={skin} roughness={0.86} /></mesh>
    <mesh position={[0, 1.6, -0.04]}><sphereGeometry args={[0.235, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color="#2e2a30" roughness={0.9} /></mesh>
    {bag && <mesh position={[0.3, 0.42, 0.1]}><boxGeometry args={[0.3, 0.42, 0.24]} /><meshStandardMaterial color="#4a5568" roughness={0.8} /></mesh>}
  </group>;
}

function Crowd() {
  const people = useMemo(() => {
    const list: { x: number; z: number }[] = [];
    for (let index = 0; index < 26; index += 1) {
      const band = index % 3;
      const base = band === 0 ? -12 : band === 1 ? -25 : -38;
      list.push({ x: -8 + (index % 7) * 2.6 + (band % 2) * 0.9, z: base - Math.floor(index / 7) * 4.4 });
    }
    return list;
  }, []);
  const group = useRef<THREE.Group>(null);
  const anchors = useRef(people);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((child, index) => {
      const origin = anchors.current[index];
      if (!origin) return;
      const sway = Math.sin(clock.elapsedTime * 0.5 + index * 1.7);
      child.position.x = origin.x + Math.sin(clock.elapsedTime * 0.22 + index) * 0.5;
      child.position.y = Math.abs(sway) * 0.018;
      child.rotation.y = Math.sin(clock.elapsedTime * 0.16 + index * 2.1) * 0.4;
    });
  });
  return <group ref={group}>{people.map((person, index) => <Traveler key={index} index={index} position={[person.x, 0, person.z]} />)}</group>;
}

/* ── floor light path ─────────────────────────────────────── */

function FloorLightPath({ progress }: { progress: number }) {
  const steps = 30;
  return <group>{Array.from({ length: steps }, (_, index) => {
    const t = index / steps;
    if (t > progress) return null;
    return <mesh key={index} position={[0, 0.02, -7 - t * 34]}>
      <planeGeometry args={[1.15, 0.55]} />
      <meshBasicMaterial color="#f5bd87" transparent opacity={0.3} toneMapped={false} />
    </mesh>;
  })}</group>;
}

/* ── companion ────────────────────────────────────────────── */

/* A billboard pixel sprite: a 24 × 32 texture that always faces the
   camera, with a four-frame walk cycle. Keeping it flat preserves the
   pixel identity inside the realistic hall. */
export function Companion({ avatarId, phaseRef }: { avatarId: SpriteGender; phaseRef: { current: PhaseProgress } }) {
  const group = useRef<THREE.Group>(null);
  const sprite = useRef<THREE.Sprite>(null);
  const material = useRef<THREE.SpriteMaterial>(null);
  const texture = useRef<THREE.CanvasTexture | null>(null);
  const frame = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    const next = new THREE.CanvasTexture(spriteCanvas(avatarId, 'idleA', 4));
    next.magFilter = THREE.NearestFilter;
    next.minFilter = THREE.NearestFilter;
    next.colorSpace = THREE.SRGBColorSpace;
    texture.current = next;
    if (material.current) { material.current.map = next; material.current.needsUpdate = true; }
    return () => { next.dispose(); };
  }, [avatarId]);

  useFrame(({ camera, clock }, delta) => {
    if (!group.current) return;
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, phaseRef.current.z, 1 - Math.pow(0.02, delta));
    const moving = Math.abs(phaseRef.current.z - group.current.position.z) > 0.14;
    group.current.position.y = moving ? Math.abs(Math.sin(clock.elapsedTime * 7)) * 0.09 : Math.sin(clock.elapsedTime * 1.6) * 0.02;
    if (sprite.current) sprite.current.quaternion.copy(camera.quaternion);
    if (clock.elapsedTime - last.current > (moving ? 0.14 : 0.62)) {
      last.current = clock.elapsedTime;
      frame.current = (frame.current + 1) % (moving ? walkOrder.length : frameOrder.length);
      const source = (moving ? walkOrder : frameOrder)[frame.current];
      if (texture.current) { texture.current.image = spriteCanvas(avatarId, source, 4); texture.current.needsUpdate = true; }
    }
  });

  return <group ref={group} position={[0.55, 0.92, 0]}>
    <sprite ref={sprite} scale={[0.9, 1.2, 1]}>
      <spriteMaterial ref={material} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  </group>;
}

/* ── scene ────────────────────────────────────────────────── */

export function TerminalScene({
  state,
  flightHighlighted,
  gateLit,
  onSelectFlight,
  onSelectGate,
}: {
  state: AppState;
  flightHighlighted: boolean;
  gateLit: boolean;
  onSelectFlight: () => void;
  onSelectGate: () => void;
}) {
  return <group>
    <Ceiling />
    <WindowBands />
    <Columns />
    <GlassWalls />
    <TerminalName />
    <Lightboxes />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, MID_Z]}>
      <planeGeometry args={[HALL.width, HALL.length]} />
      <meshStandardMaterial color="#4a5769" roughness={0.24} metalness={0.5} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, MID_Z]}>
      <planeGeometry args={[HALL.width * 0.99, HALL.length * 0.99]} />
      <meshStandardMaterial color="#5d6b7f" roughness={0.9} transparent opacity={0.28} />
    </mesh>
    <FloorLightPath progress={(state.flightAttempts > 0 ? 0.32 : 0) + (state.securityItemsPlaced.length >= 2 ? 0.36 : 0) + (state.gateFoundWithoutDirectHighlight ? 0.32 : 0)} />
    <FlightBoard highlighted={flightHighlighted} onSelect={onSelectFlight} />
    <CheckInCounters />
    <RuleBoard />
    <WayfindingSign position={[0, 6.2, -12]} width={6.4} rows={[{ arrow: 'up', cn: '安检', en: 'Security' }, { arrow: 'right', cn: '行李寄存', en: 'Left baggage' }, { arrow: 'left', cn: '出口', en: 'Exit' }]} />
    <WayfindingSign position={[0, 6.2, -32]} width={6.4} rows={[{ arrow: 'up', cn: '18 登机口', en: 'Gate 18' }, { arrow: 'left', cn: '洗手间', en: 'Restroom' }, { arrow: 'right', cn: '饮水点', en: 'Water' }]} />
    <BaggageScale />
    <SecurityLane itemsPlaced={state.securityItemsPlaced.length} />
    <GateBoard found={state.gateFoundWithoutDirectHighlight} />
    <GatePortal lit={gateLit} onSelect={onSelectGate} />
    <SeatingRows />
    <Crowd />
  </group>;
}

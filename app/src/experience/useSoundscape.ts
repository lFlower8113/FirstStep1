import { useEffect, useRef, useState } from 'react';
import type { PhaseId } from '../types';

/* A small procedural soundscape: a low hall drone whose filter and
   volume shift as the user moves from the terminal to the gate. No
   audio files, no network. Off by default so a live demo never makes
   unexpected noise. */
type Mood = 'hall' | 'security' | 'gate' | 'quiet';

const MOODS: Record<Mood, { cutoff: number; gain: number; detune: number }> = {
  hall: { cutoff: 320, gain: 0.055, detune: 0 },
  security: { cutoff: 220, gain: 0.045, detune: -6 },
  gate: { cutoff: 640, gain: 0.038, detune: 4 },
  quiet: { cutoff: 160, gain: 0.022, detune: 0 },
};

function moodFor(phase: PhaseId): Mood {
  if (phase === 'securityDemo' || phase === 'securityTip' || phase === 'security') return 'security';
  if (phase === 'findGate' || phase === 'arrive' || phase === 'reflection' || phase === 'takeaways' || phase === 'complete') return 'gate';
  if (phase === 'observe' || phase === 'demoBoard') return 'quiet';
  return 'hall';
}

export function useSoundscape(phase: PhaseId) {
  const [enabled, setEnabled] = useState(false);
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const filter = useRef<BiquadFilterNode | null>(null);
  const voices = useRef<OscillatorNode[]>([]);
  const mood = useRef<Mood>('hall');

  useEffect(() => {
    if (!enabled) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = MOODS[mood.current].cutoff;
    const reverb = ctx.createConvolver();
    const length = ctx.sampleRate * 2.4;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 2.6);
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;

    [55, 82.5, 110, 164.8].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = frequency;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.25 - index * 0.04;
      osc.connect(voiceGain).connect(lowpass);
      osc.start();
      voices.current.push(osc);
    });

    lowpass.connect(gain);
    gain.connect(ctx.destination);
    gain.connect(reverb).connect(wet).connect(ctx.destination);
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(MOODS[mood.current].gain, ctx.currentTime + 2.4);

    context.current = ctx;
    master.current = gain;
    filter.current = lowpass;

    return () => {
      voices.current.forEach((osc) => { try { osc.stop(); } catch { /* already stopped */ } });
      voices.current = [];
      void ctx.close();
      context.current = null;
      master.current = null;
      filter.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const ctx = context.current;
    if (!ctx || !master.current || !filter.current) return;
    const next = MOODS[moodFor(phase)];
    mood.current = moodFor(phase);
    filter.current.frequency.exponentialRampToValueAtTime(next.cutoff, ctx.currentTime + 1.8);
    master.current.gain.exponentialRampToValueAtTime(next.gain, ctx.currentTime + 1.8);
  }, [phase, enabled]);

  return { enabled, toggle: () => setEnabled((value) => !value) };
}

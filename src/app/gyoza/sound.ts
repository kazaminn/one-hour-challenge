/**
 * Small sound effects made with the Web Audio API, so there are no audio
 * files to ship. The context is created on first use, which is always inside
 * a click, so browsers allow it to play.
 */

export type SoundName = 'bake' | 'buy' | 'golden' | 'achievement';

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

/** A short burst of filtered noise: the "jyu" of gyoza hitting the pan. */
function sizzle(ctx: AudioContext) {
  const length = Math.floor(ctx.sampleRate * 0.09);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2_800 + Math.random() * 800;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.value = 0.12;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

function notes(ctx: AudioContext, freqs: number[], step: number, type: OscillatorType, volume: number) {
  freqs.forEach((freq, i) => {
    const at = ctx.currentTime + i * step;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + step * 2.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + step * 2.5);
  });
}

export function playSound(name: SoundName) {
  const ctx = audio();
  if (!ctx) return;
  if (name === 'bake') sizzle(ctx);
  else if (name === 'buy') notes(ctx, [660, 990], 0.06, 'square', 0.04);
  else if (name === 'golden') notes(ctx, [1047, 1319, 1568, 2093], 0.07, 'triangle', 0.12);
  else notes(ctx, [784, 1175], 0.12, 'sine', 0.15);
}

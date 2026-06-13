let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export interface SfxOptions {
  volume?: number;
  type?: OscillatorType;
}

export function playSfx(
  frequencies: number[],
  durations: number[],
  options: SfxOptions = {}
): void {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const { volume = 0.5, type = 'square' } = options;

    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    let time = ctx.currentTime;
    frequencies.forEach((freq, i) => {
      const dur = durations[i] || 0.1;
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(volume, time);
      noteGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.start(time);
      osc.stop(time + dur);
      time += dur * 0.8;
    });
  } catch {
    // ignore audio errors
  }
}

export function sfxDeliverSuccess(volume: number = 0.6): void {
  playSfx([523, 659, 784, 1047], [0.08, 0.08, 0.08, 0.15], { volume, type: 'square' });
}

export function sfxDeliverMiss(volume: number = 0.6): void {
  playSfx([294, 220, 165], [0.12, 0.15, 0.2], { volume, type: 'sawtooth' });
}

export function sfxCoin(volume: number = 0.6): void {
  playSfx([880, 1319], [0.06, 0.1], { volume, type: 'square' });
}

export function sfxHit(volume: number = 0.6): void {
  playSfx([110, 82], [0.1, 0.2], { volume, type: 'square' });
}

export function sfxPowerup(volume: number = 0.6): void {
  playSfx([392, 523, 659, 784, 1047], [0.06, 0.06, 0.06, 0.06, 0.15], { volume, type: 'triangle' });
}

export function sfxCharge(volume: number = 0.3): void {
  playSfx([220, 277, 330], [0.04, 0.04, 0.08], { volume, type: 'square' });
}

export function sfxMenuClick(volume: number = 0.5): void {
  playSfx([440, 554], [0.04, 0.06], { volume, type: 'square' });
}

export function sfxVictory(volume: number = 0.6): void {
  playSfx(
    [523, 659, 784, 659, 784, 1047],
    [0.12, 0.12, 0.12, 0.08, 0.08, 0.3],
    { volume, type: 'square' }
  );
}

export function sfxGameOver(volume: number = 0.6): void {
  playSfx(
    [392, 349, 311, 262, 220],
    [0.15, 0.15, 0.15, 0.15, 0.4],
    { volume, type: 'sawtooth' }
  );
}

let bgmInterval: number | null = null;
let bgmGain: GainNode | null = null;
let bgmNoteIndex = 0;

const bgmMelody: [number, number][] = [
  [392, 0.2], [523, 0.2], [659, 0.2], [523, 0.2],
  [392, 0.2], [659, 0.2], [784, 0.4],
  [659, 0.2], [523, 0.2], [392, 0.2], [440, 0.2],
  [523, 0.6], [0, 0.2],
  [392, 0.2], [523, 0.2], [659, 0.2], [784, 0.2],
  [880, 0.2], [784, 0.2], [659, 0.4],
  [523, 0.2], [392, 0.2], [440, 0.2], [523, 0.2],
  [392, 0.6], [0, 0.2],
];

export function startBGM(volume: number = 0.3): void {
  stopBGM();
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    bgmGain = ctx.createGain();
    bgmGain.gain.value = volume;
    bgmGain.connect(ctx.destination);
    bgmNoteIndex = 0;

    const playNextNote = () => {
      if (!bgmGain) return;
      const [freq, dur] = bgmMelody[bgmNoteIndex % bgmMelody.length];
      bgmNoteIndex++;
      if (freq > 0) {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(volume, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur * 0.9);
        osc.connect(noteGain);
        noteGain.connect(bgmGain);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      }
      bgmInterval = window.setTimeout(playNextNote, dur * 1000);
    };
    playNextNote();
  } catch {
    // ignore
  }
}

export function stopBGM(): void {
  if (bgmInterval) {
    clearTimeout(bgmInterval);
    bgmInterval = null;
  }
  if (bgmGain) {
    try { bgmGain.disconnect(); } catch { /* ignore */ }
    bgmGain = null;
  }
}

export function setBGMVolume(v: number): void {
  if (bgmGain) {
    try { bgmGain.gain.value = v; } catch { /* ignore */ }
  }
}

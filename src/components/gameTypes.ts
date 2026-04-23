export const GRAVITY = 0.55;
export const JUMP_FORCE = -13;
export const MOVE_SPEED = 5;
export const FRICTION = 0.82;

export interface Platform {
  x: number; y: number; w: number; h: number;
  type: 'solid' | 'moving' | 'crumble' | 'spike';
  vx?: number; range?: number; startX?: number; opacity?: number;
}

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

export interface LevelData {
  platforms: Platform[];
  goal: { x: number; y: number };
  bgColor1: string; bgColor2: string;
  accentColor: string;
  name: string;
  tempo: number;
}

export const LEVELS: LevelData[] = [
  {
    name: 'СТАРТ',
    bgColor1: '#0a0f1e', bgColor2: '#0d1a2e',
    accentColor: '#63ffb4',
    tempo: 100,
    goal: { x: 720, y: 200 },
    platforms: [
      { x: 0, y: 480, w: 900, h: 20, type: 'solid' },
      { x: 150, y: 380, w: 120, h: 16, type: 'solid' },
      { x: 320, y: 300, w: 120, h: 16, type: 'solid' },
      { x: 500, y: 220, w: 120, h: 16, type: 'solid' },
      { x: 680, y: 160, w: 120, h: 16, type: 'solid' },
    ]
  },
  {
    name: 'ДВИЖЕНИЕ',
    bgColor1: '#0f0a1e', bgColor2: '#1a0d2e',
    accentColor: '#ff6b9d',
    tempo: 120,
    goal: { x: 730, y: 120 },
    platforms: [
      { x: 0, y: 480, w: 300, h: 20, type: 'solid' },
      { x: 600, y: 480, w: 200, h: 20, type: 'solid' },
      { x: 150, y: 360, w: 100, h: 16, type: 'moving', vx: 1.5, range: 120, startX: 150 },
      { x: 350, y: 280, w: 100, h: 16, type: 'moving', vx: -1.2, range: 100, startX: 350 },
      { x: 550, y: 200, w: 100, h: 16, type: 'moving', vx: 1.8, range: 80, startX: 550 },
      { x: 680, y: 140, w: 120, h: 16, type: 'solid' },
    ]
  },
  {
    name: 'ОБРЫВ',
    bgColor1: '#1a0a0a', bgColor2: '#2e0d0d',
    accentColor: '#ff9d3a',
    tempo: 140,
    goal: { x: 750, y: 100 },
    platforms: [
      { x: 0, y: 480, w: 200, h: 20, type: 'solid' },
      { x: 200, y: 380, w: 90, h: 16, type: 'crumble', opacity: 1 },
      { x: 340, y: 300, w: 90, h: 16, type: 'crumble', opacity: 1 },
      { x: 480, y: 220, w: 90, h: 16, type: 'crumble', opacity: 1 },
      { x: 620, y: 140, w: 90, h: 16, type: 'crumble', opacity: 1 },
      { x: 100, y: 200, w: 60, h: 16, type: 'moving', vx: 2, range: 150, startX: 100 },
      { x: 750, y: 120, w: 120, h: 16, type: 'solid' },
    ]
  },
  {
    name: 'ШИПЫ',
    bgColor1: '#0a1a0a', bgColor2: '#0d2e0d',
    accentColor: '#39ff87',
    tempo: 160,
    goal: { x: 760, y: 80 },
    platforms: [
      { x: 0, y: 480, w: 900, h: 20, type: 'solid' },
      { x: 100, y: 400, w: 80, h: 16, type: 'solid' },
      { x: 250, y: 340, w: 80, h: 16, type: 'solid' },
      { x: 400, y: 400, w: 30, h: 20, type: 'spike' },
      { x: 460, y: 400, w: 30, h: 20, type: 'spike' },
      { x: 520, y: 400, w: 30, h: 20, type: 'spike' },
      { x: 400, y: 260, w: 80, h: 16, type: 'moving', vx: 1.5, range: 80, startX: 400 },
      { x: 560, y: 180, w: 80, h: 16, type: 'moving', vx: -2, range: 100, startX: 560 },
      { x: 700, y: 100, w: 120, h: 16, type: 'solid' },
    ]
  },
  {
    name: 'ХАОС',
    bgColor1: '#0f0a1a', bgColor2: '#1a1030',
    accentColor: '#c77dff',
    tempo: 180,
    goal: { x: 800, y: 50 },
    platforms: [
      { x: 0, y: 480, w: 100, h: 20, type: 'solid' },
      { x: 100, y: 420, w: 60, h: 16, type: 'crumble', opacity: 1 },
      { x: 220, y: 360, w: 60, h: 16, type: 'moving', vx: 2.5, range: 60, startX: 220 },
      { x: 350, y: 300, w: 60, h: 16, type: 'crumble', opacity: 1 },
      { x: 200, y: 440, w: 30, h: 20, type: 'spike' },
      { x: 470, y: 380, w: 60, h: 16, type: 'moving', vx: -2, range: 80, startX: 470 },
      { x: 590, y: 280, w: 60, h: 16, type: 'crumble', opacity: 1 },
      { x: 680, y: 200, w: 60, h: 16, type: 'moving', vx: 3, range: 60, startX: 680 },
      { x: 770, y: 100, w: 100, h: 16, type: 'solid' },
    ]
  }
];

export class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  tempo = 120;
  beatInterval: ReturnType<typeof setInterval> | null = null;
  beat = 0;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.25;
    this.masterGain.connect(this.ctx.destination);
  }

  playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() { this.playTone(280, 0.12, 'square', 0.2); setTimeout(() => this.playTone(420, 0.08, 'square', 0.15), 60); }
  playLand() { this.playTone(80, 0.1, 'sawtooth', 0.25); }
  playDie() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(440 - i * 60, 0.15, 'sawtooth', 0.2), i * 80);
    }
  }
  playWin() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this.playTone(n, 0.3, 'triangle', 0.3), i * 100));
  }

  startBeat(tempo: number, accentColor: string) {
    this.stopBeat();
    this.tempo = tempo;
    this.beat = 0;
    const interval = (60 / tempo) * 1000;
    const isHighTempo = tempo > 140;
    const baseFreqs = isHighTempo ? [80, 0, 60, 0] : [90, 0, 70, 0];
    const hiFreqs = isHighTempo ? [800, 800, 800, 800] : [600, 0, 600, 0];

    this.beatInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      const b = this.beat % 4;
      if (b === 0) this.playTone(baseFreqs[0], 0.12, 'sawtooth', 0.35);
      else if (baseFreqs[b] > 0) this.playTone(baseFreqs[b], 0.08, 'sawtooth', 0.25);
      if (hiFreqs[b] > 0) this.playTone(hiFreqs[b], 0.04, 'square', 0.08);
      if (this.beat % 2 === 1) this.playTone(200 + Math.random() * 50, 0.06, 'triangle', 0.1);
      this.beat++;
    }, interval);
  }

  stopBeat() {
    if (this.beatInterval) { clearInterval(this.beatInterval); this.beatInterval = null; }
  }
}

export const audio = new AudioEngine();

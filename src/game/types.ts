export const GRAVITY = 0.4;
export const MOVE_ACCEL = 0.35;
export const FRICTION = 0.94;
export const MAX_SPEED = 5;

export interface Platform {
  x: number; y: number; w: number; h: number;
  type: 'wood' | 'stone' | 'brick';
}

export interface Bonus {
  x: number; y: number; collected: boolean; phase: number;
}

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

export interface LevelData {
  platforms: Platform[];
  bonuses: { x: number; y: number }[];
  goal: { x: number; y: number };
  skyTop: string; skyBottom: string;
  hasEarth: boolean;
  name: string;
  tempo: number;
}

export const LEVELS: LevelData[] = [
  {
    name: 'РАССВЕТ',
    skyTop: '#d4a574', skyBottom: '#e8b88a',
    hasEarth: false, tempo: 100,
    goal: { x: 780, y: 160 },
    platforms: [
      { x: 20, y: 440, w: 240, h: 28, type: 'wood' },
      { x: 320, y: 400, w: 180, h: 28, type: 'stone' },
      { x: 560, y: 340, w: 160, h: 28, type: 'wood' },
      { x: 760, y: 260, w: 120, h: 28, type: 'brick' },
      { x: 620, y: 200, w: 140, h: 28, type: 'stone' },
    ],
    bonuses: [{ x: 380, y: 360 }, { x: 620, y: 300 }, { x: 700, y: 160 }],
  },
  {
    name: 'ОБЛАКА',
    skyTop: '#7ea8c4', skyBottom: '#a8c4d8',
    hasEarth: true, tempo: 115,
    goal: { x: 810, y: 140 },
    platforms: [
      { x: 20, y: 450, w: 180, h: 28, type: 'wood' },
      { x: 240, y: 400, w: 100, h: 24, type: 'brick' },
      { x: 380, y: 360, w: 100, h: 24, type: 'stone' },
      { x: 520, y: 310, w: 120, h: 24, type: 'wood' },
      { x: 380, y: 240, w: 120, h: 24, type: 'brick' },
      { x: 580, y: 200, w: 120, h: 24, type: 'stone' },
      { x: 760, y: 180, w: 130, h: 28, type: 'wood' },
    ],
    bonuses: [{ x: 290, y: 360 }, { x: 430, y: 320 }, { x: 630, y: 160 }, { x: 800, y: 140 }],
  },
  {
    name: 'КРЕПОСТЬ',
    skyTop: '#9a7cb8', skyBottom: '#c49a8a',
    hasEarth: true, tempo: 130,
    goal: { x: 820, y: 100 },
    platforms: [
      { x: 0, y: 460, w: 140, h: 28, type: 'stone' },
      { x: 180, y: 420, w: 80, h: 24, type: 'brick' },
      { x: 300, y: 380, w: 80, h: 24, type: 'wood' },
      { x: 220, y: 300, w: 100, h: 24, type: 'brick' },
      { x: 380, y: 240, w: 100, h: 24, type: 'stone' },
      { x: 540, y: 200, w: 100, h: 24, type: 'brick' },
      { x: 420, y: 140, w: 90, h: 24, type: 'wood' },
      { x: 680, y: 140, w: 90, h: 24, type: 'stone' },
      { x: 800, y: 120, w: 100, h: 28, type: 'brick' },
    ],
    bonuses: [{ x: 340, y: 340 }, { x: 430, y: 200 }, { x: 590, y: 160 }, { x: 720, y: 100 }, { x: 460, y: 100 }],
  },
  {
    name: 'СПИРАЛЬ',
    skyTop: '#c4a0a8', skyBottom: '#d8c0a0',
    hasEarth: true, tempo: 145,
    goal: { x: 70, y: 100 },
    platforms: [
      { x: 700, y: 450, w: 200, h: 28, type: 'wood' },
      { x: 560, y: 400, w: 100, h: 24, type: 'brick' },
      { x: 380, y: 360, w: 100, h: 24, type: 'stone' },
      { x: 200, y: 320, w: 100, h: 24, type: 'wood' },
      { x: 60, y: 260, w: 100, h: 24, type: 'brick' },
      { x: 200, y: 200, w: 100, h: 24, type: 'stone' },
      { x: 360, y: 180, w: 100, h: 24, type: 'wood' },
      { x: 520, y: 160, w: 100, h: 24, type: 'brick' },
      { x: 300, y: 100, w: 100, h: 24, type: 'stone' },
      { x: 20, y: 120, w: 140, h: 28, type: 'brick' },
    ],
    bonuses: [{ x: 610, y: 360 }, { x: 430, y: 320 }, { x: 250, y: 280 }, { x: 410, y: 140 }, { x: 570, y: 120 }, { x: 350, y: 60 }],
  },
  {
    name: 'НЕБЕСА',
    skyTop: '#3d4a6b', skyBottom: '#6b5a7a',
    hasEarth: true, tempo: 160,
    goal: { x: 810, y: 80 },
    platforms: [
      { x: 20, y: 460, w: 120, h: 28, type: 'stone' },
      { x: 180, y: 420, w: 60, h: 24, type: 'brick' },
      { x: 280, y: 380, w: 60, h: 24, type: 'wood' },
      { x: 380, y: 340, w: 60, h: 24, type: 'stone' },
      { x: 200, y: 280, w: 80, h: 24, type: 'brick' },
      { x: 340, y: 240, w: 60, h: 24, type: 'wood' },
      { x: 460, y: 200, w: 60, h: 24, type: 'stone' },
      { x: 340, y: 140, w: 80, h: 24, type: 'brick' },
      { x: 560, y: 160, w: 80, h: 24, type: 'wood' },
      { x: 700, y: 120, w: 80, h: 24, type: 'stone' },
      { x: 800, y: 100, w: 100, h: 28, type: 'brick' },
    ],
    bonuses: [{ x: 220, y: 380 }, { x: 320, y: 340 }, { x: 240, y: 240 }, { x: 380, y: 200 }, { x: 500, y: 160 }, { x: 380, y: 100 }, { x: 600, y: 120 }, { x: 740, y: 80 }],
  }
];

export class AudioEngine {
  ctx: AudioContext | null = null;
  gain: GainNode | null = null;
  beatInt: ReturnType<typeof setInterval> | null = null;
  beat = 0;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.2;
    this.gain.connect(this.ctx.destination);
  }

  tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) {
    if (!this.ctx || !this.gain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(g); g.connect(this.gain);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }

  roll(speed: number) {
    if (!this.ctx || !this.gain || Math.random() > 0.3) return;
    this.tone(60 + speed * 8, 0.05, 'sawtooth', Math.min(0.08, speed * 0.02));
  }

  bonus() { [660, 880, 1100].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, 'triangle', 0.25), i * 60)); }
  die() { for (let i = 0; i < 6; i++) setTimeout(() => this.tone(300 - i * 30, 0.1, 'sawtooth', 0.2), i * 70); }
  win() { [523, 659, 784, 1047, 1318].forEach((n, i) => setTimeout(() => this.tone(n, 0.25, 'triangle', 0.3), i * 90)); }

  start(tempo: number) {
    this.stop();
    this.beat = 0;
    const ms = (60 / tempo) * 1000;
    this.beatInt = setInterval(() => {
      const b = this.beat % 8;
      if (b === 0) this.tone(55, 0.14, 'sawtooth', 0.3);
      if (b === 4) this.tone(82, 0.1, 'sawtooth', 0.22);
      if (b % 2 === 1) this.tone(440 + Math.random() * 200, 0.04, 'square', 0.06);
      if (b === 2 || b === 6) this.tone(220, 0.06, 'triangle', 0.12);
      this.beat++;
    }, ms / 2);
  }

  stop() { if (this.beatInt) { clearInterval(this.beatInt); this.beatInt = null; } }
}

export const audio = new AudioEngine();

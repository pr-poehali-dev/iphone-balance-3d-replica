import { useEffect, useRef, useState, useCallback } from 'react';

const GRAVITY = 0.4;
const MOVE_ACCEL = 0.35;
const FRICTION = 0.94;
const MAX_SPEED = 5;

interface Platform {
  x: number; y: number; w: number; h: number;
  type: 'wood' | 'stone' | 'brick';
}

interface Rail {
  x1: number; y1: number; x2: number; y2: number;
  cx?: number; cy?: number;
}

interface Bonus {
  x: number; y: number; collected: boolean; phase: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

interface LevelData {
  platforms: Platform[];
  rails?: Rail[];
  bonuses: { x: number; y: number }[];
  goal: { x: number; y: number };
  skyTop: string; skyBottom: string;
  hasEarth: boolean;
  name: string;
  tempo: number;
}

const LEVELS: LevelData[] = [
  {
    name: 'РАССВЕТ',
    skyTop: '#d4a574', skyBottom: '#e8b88a',
    hasEarth: false, tempo: 100,
    goal: { x: 780, y: 160 },
    platforms: [
      { x: 20, y: 440, w: 240, h: 28, type: 'wood' },
      { x: 320, y: 400, w: 60, h: 28, type: 'stone' },
      { x: 560, y: 340, w: 60, h: 28, type: 'wood' },
      { x: 760, y: 260, w: 120, h: 28, type: 'brick' },
      { x: 620, y: 200, w: 140, h: 28, type: 'stone' },
    ],
    rails: [
      { x1: 260, y1: 440, x2: 320, y2: 400, cx: 290, cy: 440 },
      { x1: 380, y1: 400, x2: 560, y2: 340, cx: 470, cy: 400 },
      { x1: 620, y1: 340, x2: 760, y2: 260, cx: 690, cy: 340 },
    ],
    bonuses: [{ x: 470, y: 360 }, { x: 690, y: 290 }, { x: 700, y: 160 }],
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

class AudioEngine {
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

const audio = new AudioEngine();

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    ball: { x: 60, y: 380, vx: 0, vy: 0, r: 16, rot: 0, material: 'wood' as 'wood' | 'stone' | 'paper', onGround: false },
    platforms: [] as Platform[],
    rails: [] as Rail[],
    bonuses: [] as Bonus[],
    particles: [] as Particle[],
    keys: {} as Record<string, boolean>,
    level: 0,
    lives: 4,
    score: 0,
    phase: 'menu' as 'menu' | 'playing' | 'dead' | 'levelup' | 'win',
    phaseTimer: 0,
    frameCount: 0,
    camX: 0, camY: 0,
    audioStarted: false,
  });

  const [ui, setUi] = useState({ level: 0, lives: 4, score: 0, phase: 'menu', levelName: 'РАССВЕТ' });
  const animRef = useRef<number>(0);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 8) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random();
      s.particles.push({
        x, y,
        vx: Math.cos(a) * (1 + Math.random() * 3),
        vy: Math.sin(a) * (1 + Math.random() * 3) - 1,
        life: 1, maxLife: 1,
        color, size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const resetLevel = useCallback((i: number) => {
    const s = stateRef.current;
    const lvl = LEVELS[i];
    const firstPlat = lvl.platforms[0];
    s.ball = { x: firstPlat.x + 20, y: firstPlat.y - 20, vx: 0, vy: 0, r: 16, rot: 0, material: 'wood', onGround: false };
    s.platforms = lvl.platforms.map(p => ({ ...p }));
    s.rails = (lvl.rails || []).map(r => ({ ...r }));
    s.bonuses = lvl.bonuses.map(b => ({ ...b, collected: false, phase: Math.random() * Math.PI * 2 }));
    s.particles = [];
    s.camX = 0; s.camY = 0;
    s.frameCount = 0;
    if (s.audioStarted) audio.start(lvl.tempo);
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    audio.init();
    s.audioStarted = true;
    s.level = 0; s.lives = 4; s.score = 0;
    s.phase = 'playing';
    resetLevel(0);
    setUi({ level: 0, lives: 4, score: 0, phase: 'playing', levelName: LEVELS[0].name });
  }, [resetLevel]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => { stateRef.current.keys[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const drawPlatform = (p: Platform) => {
      const { x, y, w, h } = p;
      let baseColor: string, topColor: string, sideColor: string, strokeColor: string;

      if (p.type === 'wood') {
        baseColor = '#b8956a'; topColor = '#d4b088'; sideColor = '#8b6d4a'; strokeColor = '#6b4f2e';
      } else if (p.type === 'stone') {
        baseColor = '#a8a095'; topColor = '#c8c0b5'; sideColor = '#807568'; strokeColor = '#55493a';
      } else {
        baseColor = '#9a6850'; topColor = '#b8826a'; sideColor = '#6e4a38'; strokeColor = '#3e2a1e';
      }

      // Side (3D depth)
      const depth = 10;
      ctx.fillStyle = sideColor;
      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.lineTo(x + w + depth, y + depth);
      ctx.lineTo(x + w + depth, y + h + depth);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();

      // Bottom side
      ctx.fillStyle = sideColor;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w + depth, y + h + depth);
      ctx.lineTo(x + depth, y + h + depth);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // Top face gradient
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, baseColor);
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Texture
      if (p.type === 'wood') {
        ctx.strokeStyle = 'rgba(90,60,30,0.4)';
        ctx.lineWidth = 1;
        for (let i = 1; i < Math.floor(w / 30); i++) {
          ctx.beginPath();
          ctx.moveTo(x + i * 30, y);
          ctx.lineTo(x + i * 30, y + h);
          ctx.stroke();
        }
        // Grain
        ctx.strokeStyle = 'rgba(60,40,20,0.25)';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 5, y + 5 + i * 7);
          ctx.lineTo(x + w - 5, y + 5 + i * 7 + Math.sin(i) * 2);
          ctx.stroke();
        }
      } else if (p.type === 'brick') {
        ctx.strokeStyle = 'rgba(50,30,20,0.5)';
        ctx.lineWidth = 1;
        const bw = 20, bh = h / 2;
        for (let r = 0; r < 2; r++) {
          const off = (r % 2) * 10;
          for (let c = 0; c * bw < w; c++) {
            ctx.strokeRect(x + c * bw - off, y + r * bh, bw, bh);
          }
        }
      } else {
        // stone dots
        ctx.fillStyle = 'rgba(60,50,40,0.3)';
        for (let i = 0; i < w / 8; i++) {
          ctx.beginPath();
          ctx.arc(x + 4 + i * 8 + Math.sin(i) * 3, y + h / 2 + Math.cos(i * 2) * 4, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Top edge highlight
      ctx.fillStyle = 'rgba(255,240,200,0.35)';
      ctx.fillRect(x, y, w, 2);

      // Outer border
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);
    };

    const drawBonus = (b: Bonus, frame: number) => {
      if (b.collected) return;
      const pulse = Math.sin(frame * 0.1 + b.phase) * 0.2 + 0.8;
      const rot = frame * 0.04 + b.phase;

      ctx.save();
      ctx.translate(b.x, b.y);

      // Pink glow
      ctx.shadowColor = '#ff4488';
      ctx.shadowBlur = 20 * pulse;

      // Atom orbits
      ctx.strokeStyle = `rgba(255,80,140,${pulse})`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(rot + (i * Math.PI) / 3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Center core
      ctx.shadowBlur = 30 * pulse;
      ctx.fillStyle = '#ff6fa8';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting electrons
      for (let i = 0; i < 3; i++) {
        const a = rot + (i * Math.PI * 2) / 3;
        const ex = Math.cos(a) * 14;
        const ey = Math.sin(a) * 6;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.shadowBlur = 0;
    };

    const drawBall = (b: typeof stateRef.current.ball) => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(b.x, b.y + b.r + 2, b.r * 0.9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball body - metallic gradient
      const grad = ctx.createRadialGradient(b.x - 5, b.y - 5, 2, b.x, b.y, b.r);
      grad.addColorStop(0, '#f0f0f0');
      grad.addColorStop(0.3, '#a8a8a8');
      grad.addColorStop(0.7, '#5a5a5a');
      grad.addColorStop(1, '#2a2a2a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Rotation pattern (sphere seam)
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = 'rgba(20,20,20,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 0.8, b.r * 0.3, b.rot, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 0.3, b.r * 0.8, b.rot, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.3, b.r * 0.2, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
    };

    const railPoint = (r: Rail, t: number) => {
      if (r.cx !== undefined && r.cy !== undefined) {
        const u = 1 - t;
        return {
          x: u * u * r.x1 + 2 * u * t * r.cx + t * t * r.x2,
          y: u * u * r.y1 + 2 * u * t * r.cy + t * t * r.y2,
        };
      }
      return { x: r.x1 + (r.x2 - r.x1) * t, y: r.y1 + (r.y2 - r.y1) * t };
    };

    const drawRail = (r: Rail) => {
      // Support posts (vertical poles to ground)
      ctx.strokeStyle = '#5a5a5a';
      ctx.lineWidth = 2;
      const startPost = railPoint(r, 0);
      const endPost = railPoint(r, 1);
      [startPost, endPost].forEach(pt => {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, pt.y + 12);
        ctx.stroke();
      });

      // Shadow of rail
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r.x1 + 2, r.y1 + 4);
      if (r.cx !== undefined && r.cy !== undefined) {
        ctx.quadraticCurveTo(r.cx + 2, r.cy + 4, r.x2 + 2, r.y2 + 4);
      } else {
        ctx.lineTo(r.x2 + 2, r.y2 + 4);
      }
      ctx.stroke();

      // Dark base of rail
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      if (r.cx !== undefined && r.cy !== undefined) {
        ctx.quadraticCurveTo(r.cx, r.cy, r.x2, r.y2);
      } else {
        ctx.lineTo(r.x2, r.y2);
      }
      ctx.stroke();

      // Metallic main rail
      ctx.strokeStyle = '#c8ccd0';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      if (r.cx !== undefined && r.cy !== undefined) {
        ctx.quadraticCurveTo(r.cx, r.cy, r.x2, r.y2);
      } else {
        ctx.lineTo(r.x2, r.y2);
      }
      ctx.stroke();

      // Highlight on rail
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1 - 1);
      if (r.cx !== undefined && r.cy !== undefined) {
        ctx.quadraticCurveTo(r.cx, r.cy - 1, r.x2, r.y2 - 1);
      } else {
        ctx.lineTo(r.x2, r.y2 - 1);
      }
      ctx.stroke();
      ctx.lineCap = 'butt';

      // End caps
      [railPoint(r, 0), railPoint(r, 1)].forEach(pt => {
        const gr = ctx.createRadialGradient(pt.x - 1, pt.y - 1, 0, pt.x, pt.y, 5);
        gr.addColorStop(0, '#f0f0f0');
        gr.addColorStop(1, '#606060');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    const distToRail = (r: Rail, px: number, py: number) => {
      // Sample curve, find closest point
      let best = { d: Infinity, x: 0, y: 0, t: 0, nx: 0, ny: 0 };
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const pt = railPoint(r, t);
        const dx = px - pt.x, dy = py - pt.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < best.d) {
          const next = railPoint(r, Math.min(1, t + 0.01));
          const tx = next.x - pt.x, ty = next.y - pt.y;
          const tl = Math.sqrt(tx * tx + ty * ty) || 1;
          best = { d, x: pt.x, y: pt.y, t, nx: ty / tl, ny: -tx / tl };
        }
      }
      return best;
    };

    const drawSky = (lvl: LevelData, W: number, H: number) => {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, lvl.skyTop);
      grad.addColorStop(1, lvl.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      const s = stateRef.current;
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 220 - s.camX * 0.3 + s.frameCount * 0.2) % (W + 200)) - 100;
        const cy = 60 + i * 40;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 90, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 40, cy - 10, 60, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Earth
      if (lvl.hasEarth) {
        const ex = W / 2 - s.camX * 0.1;
        const ey = H + 100;
        const er = 250;
        const eg = ctx.createRadialGradient(ex - 60, ey - 60, 30, ex, ey, er);
        eg.addColorStop(0, '#6ab8e8');
        eg.addColorStop(0.5, '#3a78b8');
        eg.addColorStop(0.9, '#1a3868');
        eg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();

        // Continents hint
        ctx.fillStyle = 'rgba(120,180,100,0.4)';
        ctx.beginPath();
        ctx.ellipse(ex - 80, ey - 80, 50, 20, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(ex + 50, ey - 60, 40, 15, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Atmospheric haze
      const haze = ctx.createLinearGradient(0, H - 100, 0, H);
      haze.addColorStop(0, 'rgba(255,255,255,0)');
      haze.addColorStop(1, 'rgba(255,255,255,0.15)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, H - 100, W, 100);
    };

    const drawGoal = (g: { x: number; y: number }, frame: number) => {
      const pulse = Math.sin(frame * 0.08) * 0.3 + 0.7;
      ctx.save();
      ctx.translate(g.x, g.y);

      // Glow ring
      ctx.shadowColor = '#ffdd44';
      ctx.shadowBlur = 25 * pulse;

      // Base pedestal
      ctx.fillStyle = '#6a5a48';
      ctx.fillRect(-18, -4, 36, 8);
      ctx.fillStyle = '#8a7858';
      ctx.fillRect(-18, -4, 36, 3);

      // Flag pole
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(-1, -40, 2, 36);

      // Flag
      const wave = Math.sin(frame * 0.15) * 3;
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      ctx.moveTo(1, -38);
      ctx.lineTo(22 + wave, -32);
      ctx.lineTo(22, -24);
      ctx.lineTo(1, -22);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#aa8822';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const draw = () => {
      const s = stateRef.current;
      const lvl = LEVELS[Math.min(s.level, LEVELS.length - 1)];
      const W = canvas.width, H = canvas.height;

      drawSky(lvl, W, H);

      ctx.save();
      ctx.translate(-s.camX, -s.camY);

      // Goal
      drawGoal(lvl.goal, s.frameCount);

      // Platforms (sort by y for depth)
      const sorted = [...s.platforms].sort((a, b) => a.y - b.y);
      sorted.forEach(drawPlatform);

      // Rails
      s.rails.forEach(drawRail);

      // Bonuses
      s.bonuses.forEach(b => drawBonus(b, s.frameCount));

      // Ball
      drawBall(s.ball);

      // Particles
      s.particles.forEach(pt => {
        const alpha = pt.life / pt.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      ctx.restore();

      // Overlays
      if (s.phase === 'dead') {
        ctx.fillStyle = `rgba(100,10,10,${Math.min(s.phaseTimer / 40, 0.55)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 44px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff3355';
        ctx.shadowBlur = 20;
        ctx.fillText('ШАР ПОТЕРЯН', W / 2, H / 2 - 10);
        ctx.shadowBlur = 0;
        ctx.font = '20px Rajdhani';
        ctx.fillStyle = '#ddd';
        ctx.fillText(s.lives > 0 ? `Осталось шаров: ${s.lives}` : 'ПРОБЕЛ — заново', W / 2, H / 2 + 26);
      }

      if (s.phase === 'levelup') {
        ctx.fillStyle = `rgba(15,25,45,${Math.min(s.phaseTimer / 25, 0.85)})`;
        ctx.fillRect(0, 0, W, H);
        const t = Math.min(s.phaseTimer / 25, 1);
        ctx.globalAlpha = t;
        ctx.fillStyle = '#ffdd44';
        ctx.font = 'bold 50px Russo One, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffdd44';
        ctx.shadowBlur = 30;
        ctx.fillText(`УРОВЕНЬ ${s.level + 1}`, W / 2, H / 2 - 10);
        ctx.shadowBlur = 0;
        ctx.font = '24px Rajdhani';
        ctx.fillStyle = '#fff';
        ctx.fillText(LEVELS[Math.min(s.level, LEVELS.length - 1)].name, W / 2, H / 2 + 30);
        ctx.globalAlpha = 1;
      }

      if (s.phase === 'win') {
        ctx.fillStyle = `rgba(10,20,35,0.92)`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffdd44';
        ctx.font = 'bold 56px Russo One, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffdd44';
        ctx.shadowBlur = 40;
        ctx.fillText('ПОБЕДА!', W / 2, H / 2 - 40);
        ctx.shadowBlur = 0;
        ctx.font = '26px Rajdhani';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Финальный счёт: ${s.score}`, W / 2, H / 2 + 10);
      }
    };

    const killBall = () => {
      const s = stateRef.current;
      if (s.phase !== 'playing') return;
      s.lives--;
      s.phase = 'dead';
      s.phaseTimer = 0;
      audio.die();
      spawnParticles(s.ball.x, s.ball.y, '#aaaaaa', 14);
      setUi(u => ({ ...u, lives: s.lives, phase: 'dead' }));
    };

    const update = () => {
      const s = stateRef.current;

      if (s.phase !== 'playing') {
        s.frameCount++;
        s.phaseTimer++;
        if (s.phase === 'dead') {
          if (s.phaseTimer > 80) {
            if (s.lives > 0) {
              s.phase = 'playing';
              resetLevel(s.level);
              setUi(u => ({ ...u, phase: 'playing' }));
            } else if (s.keys['Space']) {
              s.lives = 4; s.score = 0; s.level = 0;
              s.phase = 'playing';
              resetLevel(0);
              setUi({ level: 0, lives: 4, score: 0, phase: 'playing', levelName: LEVELS[0].name });
            }
          }
        }
        if (s.phase === 'levelup' && s.phaseTimer > 80) {
          s.phase = 'playing';
          resetLevel(s.level);
          setUi(u => ({ ...u, phase: 'playing', levelName: LEVELS[s.level].name }));
        }
        if (s.phase === 'win' && s.keys['Space']) startGame();
        return;
      }

      s.frameCount++;
      const b = s.ball;
      const lvl = LEVELS[s.level];

      // Input
      const left = s.keys['ArrowLeft'] || s.keys['KeyA'];
      const right = s.keys['ArrowRight'] || s.keys['KeyD'];
      const jump = s.keys['Space'] || s.keys['ArrowUp'] || s.keys['KeyW'];

      if (left) b.vx -= MOVE_ACCEL;
      if (right) b.vx += MOVE_ACCEL;
      b.vx *= FRICTION;
      if (Math.abs(b.vx) > MAX_SPEED) b.vx = Math.sign(b.vx) * MAX_SPEED;

      if (jump && b.onGround) {
        b.vy = -9;
        b.onGround = false;
        audio.tone(400, 0.1, 'sine', 0.15);
      }

      b.vy += GRAVITY;
      if (b.vy > 14) b.vy = 14;

      // Rolling sound
      if (b.onGround && Math.abs(b.vx) > 1) audio.roll(Math.abs(b.vx));

      // Rotate based on velocity
      b.rot += b.vx * 0.08;

      // Horizontal move + collision
      b.x += b.vx;
      s.platforms.forEach(p => {
        if (b.x + b.r > p.x && b.x - b.r < p.x + p.w && b.y + b.r > p.y && b.y - b.r < p.y + p.h) {
          if (b.vx > 0) b.x = p.x - b.r;
          else if (b.vx < 0) b.x = p.x + p.w + b.r;
          b.vx = 0;
        }
      });

      // Vertical move + collision
      b.y += b.vy;
      const wasGround = b.onGround;
      b.onGround = false;
      s.platforms.forEach(p => {
        if (b.x + b.r > p.x && b.x - b.r < p.x + p.w && b.y + b.r > p.y && b.y - b.r < p.y + p.h) {
          if (b.vy > 0) {
            b.y = p.y - b.r;
            if (b.vy > 3 && !wasGround) audio.tone(120, 0.08, 'sawtooth', 0.15);
            b.vy = 0;
            b.onGround = true;
          } else if (b.vy < 0) {
            b.y = p.y + p.h + b.r;
            b.vy = 0;
          }
        }
      });

      // Rails — ball rolls on top of rail if close enough
      s.rails.forEach(r => {
        const info = distToRail(r, b.x, b.y + b.r);
        if (info.d < 10 && b.vy >= -1) {
          // Snap ball to rail top
          const railPt = info;
          // Estimate slope direction at contact
          const ahead = railPoint(r, Math.min(1, info.t + 0.05));
          const behind = railPoint(r, Math.max(0, info.t - 0.05));
          const dxs = ahead.x - behind.x;
          const dys = ahead.y - behind.y;
          const len = Math.sqrt(dxs * dxs + dys * dys) || 1;
          const slope = dys / len;
          // Place ball on rail
          b.y = railPt.y - b.r;
          b.vy = 0;
          b.onGround = true;
          // Gravity acceleration along rail (slope effect)
          b.vx += slope * 0.5;
          if (Math.abs(b.vx) > MAX_SPEED + 3) b.vx = Math.sign(b.vx) * (MAX_SPEED + 3);
          // Sparks while rolling fast
          if (Math.abs(b.vx) > 2 && Math.random() < 0.25) {
            spawnParticles(b.x, b.y + b.r, '#ffe0a8', 1);
            if (Math.random() < 0.3) audio.tone(800 + Math.random() * 400, 0.03, 'square', 0.05);
          }
        }
      });

      // Fall death
      if (b.y > 600) killBall();

      // Bonus collection
      s.bonuses.forEach(bn => {
        if (bn.collected) return;
        const dx = bn.x - b.x, dy = bn.y - b.y;
        if (dx * dx + dy * dy < (b.r + 14) * (b.r + 14)) {
          bn.collected = true;
          s.score += 100;
          audio.bonus();
          spawnParticles(bn.x, bn.y, '#ff6fa8', 12);
          setUi(u => ({ ...u, score: s.score }));
        }
      });

      // Goal
      const g = lvl.goal;
      if (Math.abs(b.x - g.x) < 30 && Math.abs(b.y - (g.y - 10)) < 30) {
        s.score += 500 + LEVELS[s.level].bonuses.filter((_, i) => s.bonuses[i].collected).length * 50;
        audio.win();
        spawnParticles(g.x, g.y - 20, '#ffdd44', 24);
        if (s.level + 1 >= LEVELS.length) {
          s.phase = 'win';
          s.phaseTimer = 0;
          audio.stop();
          setUi(u => ({ ...u, phase: 'win', score: s.score }));
        } else {
          s.level++;
          s.phase = 'levelup';
          s.phaseTimer = 0;
          setUi(u => ({ ...u, phase: 'levelup', level: s.level, score: s.score }));
        }
      }

      // Camera follow
      const tx = Math.max(0, Math.min(b.x - canvas.width * 0.4, 200));
      s.camX += (tx - s.camX) * 0.08;

      // Particles
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.2;
        p.life -= 1 / (p.maxLife * 35);
      });
      s.particles = s.particles.filter(p => p.life > 0);
    };

    const loop = () => {
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [resetLevel, spawnParticles, startGame]);

  const handleTouch = (k: string, on: boolean) => { stateRef.current.keys[k] = on; };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden font-rajdhani"
      style={{ background: 'radial-gradient(ellipse at center, #2a3548, #0a1220)' }}>

      {ui.phase === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 animate-fade-in"
          style={{ background: 'radial-gradient(ellipse at center, rgba(80,120,180,0.25), rgba(10,15,30,0.9))' }}>
          <div className="text-center">
            <div className="mb-3 tracking-[0.5em] text-xs font-mono text-[#ffdd44] opacity-70">PHYSICS · BALL · ADVENTURE</div>
            <h1 className="font-russo text-[88px] leading-none text-white mb-2 tracking-wider"
              style={{ textShadow: '0 4px 0 #8a6030, 0 8px 30px rgba(0,0,0,0.8), 0 0 60px #ffdd4430' }}>
              BALLANCE
            </h1>
            <div className="text-[#c8a878] text-sm tracking-[0.7em] mb-10 opacity-80">МЕТАЛЛ · ДЕРЕВО · КАМЕНЬ</div>

            {/* Ball preview */}
            <div className="flex justify-center mb-10">
              <div className="w-20 h-20 rounded-full animate-float relative"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #a0a0a0 40%, #404040 85%)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset -5px -8px 15px rgba(0,0,0,0.5)'
                }}>
                <div className="absolute top-2 left-3 w-4 h-3 rounded-full bg-white/70 blur-[1px]" />
              </div>
            </div>

            <div className="flex gap-6 justify-center mb-10 text-xs text-gray-400 tracking-widest">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border border-[#c8a87840] rounded bg-[#c8a87810] flex items-center justify-center text-[#ffdd44]">←→</div>
                <span>КАТИТЬ</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border border-[#c8a87840] rounded bg-[#c8a87810] flex items-center justify-center text-[#ffdd44]">⎵</div>
                <span>ПРЫЖОК</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-20 py-4 text-xl font-russo tracking-widest text-[#3e2a0e] rounded-md transition-all duration-200 hover:scale-105 hover:brightness-110"
              style={{
                background: 'linear-gradient(180deg, #ffe680 0%, #ffc040 50%, #d89020 100%)',
                boxShadow: '0 6px 0 #8a5a10, 0 10px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)'
              }}
            >
              ИГРАТЬ
            </button>

            <div className="mt-8 text-gray-500 text-xs tracking-[0.3em]">5 УРОВНЕЙ · БОНУСЫ · ФИЗИКА ШАРА</div>
          </div>
        </div>
      )}

      {ui.phase !== 'menu' && (
        <>
          {/* Frame around canvas: retro HUD */}
          <div className="relative">
            {/* Top HUD plate */}
            <div className="absolute -top-12 left-0 right-0 flex justify-between items-center z-20 px-2">
              {/* Score plate (left, rounded like in screenshots) */}
              <div className="relative">
                <div className="flex items-center gap-2 px-5 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, #2a3548, #151e30)',
                    border: '1.5px solid #5a7aa0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}>
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 shadow-inner" />
                  <div className="font-mono text-xl tracking-wider" style={{ color: '#e8d090', textShadow: '0 0 8px #ffdd44' }}>
                    {String(ui.score).padStart(4, '0')}
                  </div>
                </div>
              </div>

              {/* Level badge center */}
              <div className="px-4 py-1.5 rounded-md text-xs font-mono tracking-[0.3em]"
                style={{
                  background: 'linear-gradient(180deg, #3e2e1e, #1e1408)',
                  border: '1px solid #8a6030',
                  color: '#ffdd44'
                }}>
                LVL {ui.level + 1} · {ui.levelName}
              </div>

              {/* Lives plate (right) */}
              <div className="relative">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, #2a3548, #151e30)',
                    border: '1.5px solid #5a7aa0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full transition-all"
                      style={{
                        background: i < ui.lives
                          ? 'radial-gradient(circle at 30% 30%, #f0f0f0, #888 50%, #2a2a2a)'
                          : 'radial-gradient(circle at 30% 30%, #333, #1a1a1a)',
                        boxShadow: i < ui.lives ? 'inset -1px -2px 3px rgba(0,0,0,0.6)' : 'none',
                        opacity: i < ui.lives ? 1 : 0.3
                      }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas with ornate frame */}
            <div className="relative rounded-xl p-1"
              style={{
                background: 'linear-gradient(135deg, #8a6030 0%, #4a3820 50%, #8a6030 100%)',
                boxShadow: '0 15px 50px rgba(0,0,0,0.7), inset 0 0 20px rgba(0,0,0,0.4)'
              }}>
              <canvas
                ref={canvasRef}
                width={900}
                height={500}
                className="rounded-lg block"
                style={{ maxWidth: '100vw' }}
              />
            </div>

            {/* Bottom bonus progress indicator */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center items-center gap-2 z-10">
              <div className="text-xs font-mono tracking-widest text-[#c8a878]">БОНУСЫ</div>
              <div className="flex gap-1.5">
                {LEVELS[Math.min(ui.level, LEVELS.length - 1)].bonuses.map((_, i) => {
                  const collected = stateRef.current.bonuses[i]?.collected;
                  return (
                    <div key={i} className="w-3 h-3 rounded-full transition-all"
                      style={{
                        background: collected
                          ? 'radial-gradient(circle, #ff6fa8, #aa2266)'
                          : 'rgba(200,168,120,0.15)',
                        boxShadow: collected ? '0 0 8px #ff6fa8' : 'none',
                        border: '1px solid rgba(200,168,120,0.4)'
                      }} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Touch controls mobile */}
          <div className="flex gap-4 mt-20 md:hidden">
            <button
              onTouchStart={() => handleTouch('ArrowLeft', true)}
              onTouchEnd={() => handleTouch('ArrowLeft', false)}
              className="w-16 h-16 rounded-xl text-2xl font-russo active:scale-90 transition-transform text-[#3e2a0e]"
              style={{ background: 'linear-gradient(180deg, #ffe680, #d89020)', boxShadow: '0 4px 0 #8a5a10' }}
            >←</button>
            <button
              onTouchStart={() => handleTouch('Space', true)}
              onTouchEnd={() => handleTouch('Space', false)}
              className="w-16 h-16 rounded-xl text-2xl font-russo active:scale-90 transition-transform text-[#3e2a0e]"
              style={{ background: 'linear-gradient(180deg, #ffe680, #d89020)', boxShadow: '0 4px 0 #8a5a10' }}
            >⬆</button>
            <button
              onTouchStart={() => handleTouch('ArrowRight', true)}
              onTouchEnd={() => handleTouch('ArrowRight', false)}
              className="w-16 h-16 rounded-xl text-2xl font-russo active:scale-90 transition-transform text-[#3e2a0e]"
              style={{ background: 'linear-gradient(180deg, #ffe680, #d89020)', boxShadow: '0 4px 0 #8a5a10' }}
            >→</button>
          </div>
        </>
      )}
    </div>
  );
}
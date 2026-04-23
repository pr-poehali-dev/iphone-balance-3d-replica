import { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const GRAVITY = 0.55;
const JUMP_FORCE = -13;
const MOVE_SPEED = 5;
const FRICTION = 0.82;

interface Platform {
  x: number; y: number; w: number; h: number;
  type: 'solid' | 'moving' | 'crumble' | 'spike';
  vx?: number; range?: number; startX?: number; opacity?: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

interface LevelData {
  platforms: Platform[];
  goal: { x: number; y: number };
  bgColor1: string; bgColor2: string;
  accentColor: string;
  name: string;
  tempo: number;
}

const LEVELS: LevelData[] = [
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

class AudioEngine {
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

const audio = new AudioEngine();

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    player: { x: 60, y: 400, vx: 0, vy: 0, w: 28, h: 36, onGround: false, facingRight: true, coyoteTime: 0, jumpBuffer: 0 },
    platforms: [] as Platform[],
    particles: [] as Particle[],
    keys: {} as Record<string, boolean>,
    level: 0,
    lives: 3,
    score: 0,
    phase: 'menu' as 'menu' | 'playing' | 'dead' | 'levelup' | 'win',
    phaseTimer: 0,
    cameraX: 0,
    deathY: 600,
    frameCount: 0,
    crumbleTimers: {} as Record<number, number>,
    audioStarted: false,
  });

  const [ui, setUi] = useState({ level: 0, lives: 3, score: 0, phase: 'menu' as string, levelName: 'СТАРТ' });
  const animRef = useRef<number>(0);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 8, speed = 3) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 1,
        life: 1, maxLife: 1,
        color, size: 2 + Math.random() * 4,
      });
    }
  }, []);

  const resetLevel = useCallback((levelIdx: number) => {
    const s = stateRef.current;
    const lvl = LEVELS[levelIdx];
    s.player = { x: 60, y: 400, vx: 0, vy: 0, w: 28, h: 36, onGround: false, facingRight: true, coyoteTime: 0, jumpBuffer: 0 };
    s.platforms = lvl.platforms.map(p => ({ ...p, opacity: p.type === 'crumble' ? 1 : undefined }));
    s.particles = [];
    s.cameraX = 0;
    s.crumbleTimers = {};
    s.frameCount = 0;
    if (s.audioStarted) audio.startBeat(lvl.tempo, lvl.accentColor);
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    audio.init();
    s.audioStarted = true;
    s.level = 0;
    s.lives = 3;
    s.score = 0;
    s.phase = 'playing';
    resetLevel(0);
    setUi({ level: 0, lives: 3, score: 0, phase: 'playing', levelName: LEVELS[0].name });
  }, [resetLevel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      stateRef.current.keys[e.code] = down;
      if (down && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) {
        stateRef.current.player.jumpBuffer = 12;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', e => onKey(e, true));
    window.addEventListener('keyup', e => onKey(e, false));
    return () => {
      window.removeEventListener('keydown', e => onKey(e, true));
      window.removeEventListener('keyup', e => onKey(e, false));
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const s = stateRef.current;
      const lvl = LEVELS[Math.min(s.level, LEVELS.length - 1)];
      const W = canvas.width, H = canvas.height;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, lvl.bgColor1);
      grad.addColorStop(1, lvl.bgColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Grid overlay
      ctx.strokeStyle = `${lvl.accentColor}08`;
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = (-s.cameraX % gridSize); x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      ctx.save();
      ctx.translate(-s.cameraX, 0);

      // Goal
      const goal = lvl.goal;
      const pulse = Math.sin(s.frameCount * 0.08) * 0.3 + 0.7;
      ctx.shadowColor = lvl.accentColor;
      ctx.shadowBlur = 20 * pulse;
      ctx.fillStyle = `${lvl.accentColor}${Math.floor(pulse * 80).toString(16).padStart(2, '0')}`;
      ctx.fillRect(goal.x, goal.y - 30, 24, 24);
      ctx.strokeStyle = lvl.accentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(goal.x, goal.y - 30, 24, 24);
      // star inside goal
      ctx.fillStyle = lvl.accentColor;
      ctx.font = '16px serif';
      ctx.fillText('★', goal.x + 4, goal.y - 10);
      ctx.shadowBlur = 0;

      // Platforms
      s.platforms.forEach((p, i) => {
        if (p.type === 'spike') {
          // Spikes
          const spikeW = 10;
          const count = Math.floor(p.w / spikeW);
          ctx.fillStyle = '#ff3355';
          ctx.shadowColor = '#ff3355';
          ctx.shadowBlur = 8;
          for (let k = 0; k < count; k++) {
            ctx.beginPath();
            ctx.moveTo(p.x + k * spikeW, p.y + p.h);
            ctx.lineTo(p.x + k * spikeW + spikeW / 2, p.y);
            ctx.lineTo(p.x + (k + 1) * spikeW, p.y + p.h);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          return;
        }

        const alpha = p.opacity !== undefined ? p.opacity : 1;
        if (alpha <= 0) return;

        let color1, color2, glowColor;
        if (p.type === 'moving') {
          color1 = '#1a2a4a'; color2 = '#0d1a2e'; glowColor = '#4a9eff';
        } else if (p.type === 'crumble') {
          const r = Math.floor(60 * alpha + 30);
          color1 = `rgba(${r + 40},${r},${r * 0.5},${alpha})`;
          color2 = `rgba(${r},${r * 0.5},${r * 0.3},${alpha})`;
          glowColor = '#ff6b3a';
        } else {
          color1 = '#1a2a3a'; color2 = '#0d1a28'; glowColor = lvl.accentColor;
        }

        const pgr = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
        pgr.addColorStop(0, color1);
        pgr.addColorStop(1, color2);

        ctx.globalAlpha = alpha;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        ctx.fillStyle = pgr;
        ctx.fillRect(p.x, p.y, p.w, p.h);

        // Top edge glow
        ctx.fillStyle = p.type === 'crumble' ? `rgba(255,140,80,${alpha * 0.8})` :
          p.type === 'moving' ? 'rgba(74,158,255,0.8)' : `${lvl.accentColor}cc`;
        ctx.fillRect(p.x, p.y, p.w, 2);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // Player
      const p = s.player;
      const bobY = p.onGround ? Math.sin(s.frameCount * 0.18) * 1 : 0;

      // Player shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.ellipse(p.x + p.w / 2, 482, p.w * 0.6, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body gradient
      const bodyGrad = ctx.createLinearGradient(p.x, p.y + bobY, p.x + p.w, p.y + p.h + bobY);
      bodyGrad.addColorStop(0, '#e8f4ff');
      bodyGrad.addColorStop(0.4, '#b0d4f8');
      bodyGrad.addColorStop(1, '#7ab0e8');
      ctx.shadowColor = lvl.accentColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + bobY, p.w, p.h, 6);
      ctx.fill();

      // Suit details
      ctx.fillStyle = 'rgba(0,20,60,0.6)';
      ctx.fillRect(p.x + 6, p.y + 10 + bobY, p.w - 12, 10);
      ctx.fillStyle = `${lvl.accentColor}cc`;
      ctx.fillRect(p.x + 9, p.y + 13 + bobY, p.w - 18, 4);

      // Visor
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      ctx.roundRect(p.x + 5, p.y + bobY + 4, p.w - 10, 8, 3);
      ctx.fill();
      ctx.fillStyle = `${lvl.accentColor}80`;
      ctx.fillRect(p.x + 7, p.y + bobY + 5, p.w - 14, 6);
      ctx.shadowBlur = 0;

      // Particles
      s.particles.forEach(pt => {
        const alpha = pt.life / pt.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;

      ctx.restore();

      // HUD scanline effect
      ctx.fillStyle = `rgba(0,0,0,0)`;
      const scanY = ((s.frameCount * 2) % (H + 40)) - 40;
      const scanGrad = ctx.createLinearGradient(0, scanY, 0, scanY + 40);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, `${lvl.accentColor}06`);
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY, W, 40);

      // Phase overlays
      if (s.phase === 'dead') {
        ctx.fillStyle = `rgba(180,20,20,${Math.min(s.phaseTimer / 30, 0.6)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 42px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff3355';
        ctx.shadowBlur = 20;
        ctx.fillText('УНИЧТОЖЕН', W / 2, H / 2 - 20);
        ctx.shadowBlur = 0;
        ctx.font = '22px Rajdhani, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Осталось жизней: ${s.lives}`, W / 2, H / 2 + 20);
        if (s.lives <= 0) {
          ctx.fillStyle = '#ff6b6b';
          ctx.fillText('Нажми ПРОБЕЛ для перезапуска', W / 2, H / 2 + 55);
        }
      }

      if (s.phase === 'levelup') {
        ctx.fillStyle = `rgba(10,20,40,${Math.min(s.phaseTimer / 20, 0.8)})`;
        ctx.fillRect(0, 0, W, H);
        const t = Math.min(s.phaseTimer / 20, 1);
        ctx.globalAlpha = t;
        ctx.fillStyle = lvl.accentColor;
        ctx.font = 'bold 52px Russo One, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = lvl.accentColor;
        ctx.shadowBlur = 30;
        ctx.fillText(`УРОВЕНЬ ${s.level}`, W / 2, H / 2 - 20);
        ctx.shadowBlur = 0;
        ctx.font = '26px Rajdhani, sans-serif';
        ctx.fillStyle = '#ccc';
        ctx.fillText(LEVELS[Math.min(s.level, LEVELS.length - 1)].name, W / 2, H / 2 + 30);
        ctx.globalAlpha = 1;
      }

      if (s.phase === 'win') {
        ctx.fillStyle = `rgba(5,15,30,0.9)`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#63ffb4';
        ctx.font = 'bold 56px Russo One, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#63ffb4';
        ctx.shadowBlur = 40;
        ctx.fillText('ПОБЕДА!', W / 2, H / 2 - 40);
        ctx.shadowBlur = 0;
        ctx.font = '28px Rajdhani, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Счёт: ${s.score}`, W / 2, H / 2 + 20);
        ctx.font = '20px IBM Plex Mono, monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('ПРОБЕЛ — заново', W / 2, H / 2 + 60);
      }
    };

    const update = () => {
      const s = stateRef.current;
      if (s.phase !== 'playing') {
        s.frameCount++;
        s.phaseTimer++;
        if (s.phase === 'dead') {
          if (s.phaseTimer > 90) {
            if (s.lives > 0) {
              s.phase = 'playing';
              resetLevel(s.level);
              setUi(u => ({ ...u, phase: 'playing' }));
            } else if (s.keys['Space']) {
              s.lives = 3; s.score = 0; s.level = 0;
              s.phase = 'playing';
              resetLevel(0);
              setUi({ level: 0, lives: 3, score: 0, phase: 'playing', levelName: LEVELS[0].name });
            }
          }
        }
        if (s.phase === 'levelup' && s.phaseTimer > 80) {
          s.phase = 'playing';
          resetLevel(s.level);
          setUi(u => ({ ...u, phase: 'playing', levelName: LEVELS[s.level].name }));
        }
        return;
      }

      s.frameCount++;
      const lvl = LEVELS[s.level];
      const p = s.player;

      // Input
      const left = s.keys['ArrowLeft'] || s.keys['KeyA'];
      const right = s.keys['ArrowRight'] || s.keys['KeyD'];
      if (left) { p.vx -= 1.2; p.facingRight = false; }
      if (right) { p.vx += 1.2; p.facingRight = true; }
      p.vx *= FRICTION;
      if (Math.abs(p.vx) > MOVE_SPEED) p.vx = Math.sign(p.vx) * MOVE_SPEED;

      // Jump
      if (p.jumpBuffer > 0 && p.coyoteTime > 0) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        p.coyoteTime = 0;
        p.jumpBuffer = 0;
        audio.playJump();
        spawnParticles(p.x + p.w / 2, p.y + p.h, lvl.accentColor, 6, 2);
      }
      if (p.jumpBuffer > 0) p.jumpBuffer--;
      if (p.coyoteTime > 0) p.coyoteTime--;

      // Gravity
      p.vy += GRAVITY;
      if (p.vy > 18) p.vy = 18;

      // Move platform update
      s.platforms.forEach((plat) => {
        if (plat.type === 'moving' && plat.vx !== undefined && plat.startX !== undefined && plat.range !== undefined) {
          plat.x += plat.vx;
          if (plat.x > plat.startX + plat.range || plat.x < plat.startX - plat.range) {
            plat.vx = -plat.vx;
          }
        }
      });

      // Horizontal movement
      p.x += p.vx;
      const wasOnGround = p.onGround;
      p.onGround = false;

      // Collision X
      s.platforms.forEach((plat, i) => {
        if (plat.type === 'spike' || (plat.opacity !== undefined && plat.opacity <= 0)) return;
        if (p.x < plat.x + plat.w && p.x + p.w > plat.x && p.y < plat.y + plat.h && p.y + p.h > plat.y) {
          if (p.vx > 0) p.x = plat.x - p.w;
          else p.x = plat.x + plat.w;
          p.vx = 0;
        }
      });

      // Vertical movement
      p.y += p.vy;

      // Collision Y
      s.platforms.forEach((plat, i) => {
        if (plat.type === 'spike') {
          if (p.x < plat.x + plat.w && p.x + p.w > plat.x && p.y < plat.y + plat.h && p.y + p.h > plat.y) {
            killPlayer();
          }
          return;
        }
        const alpha = plat.opacity !== undefined ? plat.opacity : 1;
        if (alpha <= 0) return;
        if (p.x < plat.x + plat.w && p.x + p.w > plat.x && p.y < plat.y + plat.h && p.y + p.h > plat.y) {
          if (p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.onGround = true;
            p.coyoteTime = 8;
            if (!wasOnGround) {
              audio.playLand();
              spawnParticles(p.x + p.w / 2, p.y + p.h, lvl.accentColor, 4, 1.5);
            }
            // Crumble
            if (plat.type === 'crumble') {
              if (s.crumbleTimers[i] === undefined) s.crumbleTimers[i] = 60;
              s.crumbleTimers[i]--;
              if (s.crumbleTimers[i] <= 0 && plat.opacity !== undefined) {
                plat.opacity = Math.max(0, plat.opacity - 0.05);
                spawnParticles(plat.x + plat.w / 2, plat.y, '#ff6b3a', 3, 1.5);
              } else if (plat.opacity !== undefined && plat.opacity < 1) {
                plat.opacity = Math.max(0, plat.opacity - 0.04);
              }
            }
            // Moving platform carry
            if (plat.type === 'moving' && plat.vx !== undefined) {
              p.x += plat.vx;
            }
          } else if (p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          }
        }
      });

      // Fall death
      if (p.y > 600) killPlayer();

      // Goal collection
      const goal = lvl.goal;
      if (p.x < goal.x + 24 && p.x + p.w > goal.x && p.y < goal.y - 6 && p.y + p.h > goal.y - 30) {
        s.score += 100 + (5 - s.level) * 10;
        audio.playWin();
        spawnParticles(goal.x + 12, goal.y - 18, lvl.accentColor, 20, 5);
        if (s.level + 1 >= LEVELS.length) {
          s.phase = 'win';
          s.phaseTimer = 0;
          audio.stopBeat();
          setUi(u => ({ ...u, phase: 'win', score: s.score }));
        } else {
          s.level++;
          s.phase = 'levelup';
          s.phaseTimer = 0;
          setUi(u => ({ ...u, phase: 'levelup', level: s.level, score: s.score }));
        }
      }

      // Camera
      const targetCamX = p.x - canvasRef.current!.width * 0.35;
      s.cameraX += (Math.max(0, targetCamX) - s.cameraX) * 0.1;

      // Particles update
      s.particles.forEach(pt => {
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vy += 0.15;
        pt.life -= 1 / (pt.maxLife * 30);
      });
      s.particles = s.particles.filter(pt => pt.life > 0);
    };

    const killPlayer = () => {
      const s = stateRef.current;
      if (s.phase !== 'playing') return;
      s.lives--;
      s.phase = 'dead';
      s.phaseTimer = 0;
      audio.playDie();
      spawnParticles(s.player.x + s.player.w / 2, s.player.y + s.player.h / 2, '#ff3355', 16, 5);
      setUi(u => ({ ...u, lives: s.lives, phase: 'dead' }));
    };

    const loop = () => {
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [resetLevel, spawnParticles]);

  // Touch controls
  const handleTouch = (dir: string, active: boolean) => {
    stateRef.current.keys[dir] = active;
    if (dir === 'jump' && active) stateRef.current.player.jumpBuffer = 12;
  };

  const accentColor = LEVELS[Math.min(ui.level, LEVELS.length - 1)].accentColor;

  return (
    <div className="min-h-screen bg-[#060b14] flex flex-col items-center justify-center overflow-hidden font-rajdhani">
      {ui.phase === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-center animate-fade-in">
            <div className="mb-2 tracking-[0.4em] text-xs font-mono text-[#63ffb4] opacity-60">ФИЗИЧЕСКИЙ ПЛАТФОРМЕР</div>
            <h1 className="font-russo text-7xl text-white mb-1 tracking-wider"
              style={{ textShadow: '0 0 40px #63ffb4, 0 0 80px #63ffb420' }}>
              GRAVITON
            </h1>
            <div className="text-[#63ffb4] text-sm tracking-[0.6em] mb-12 opacity-70">v 1.0</div>

            <div className="flex gap-8 justify-center mb-12 text-sm text-gray-400 tracking-widest">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border border-[#63ffb430] rounded flex items-center justify-center text-[#63ffb4]">↑</div>
                <span>ПРЫЖОК</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border border-[#63ffb430] rounded flex items-center justify-center text-[#63ffb4]">←</div>
                <span>ВЛЕВО</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border border-[#63ffb430] rounded flex items-center justify-center text-[#63ffb4]">→</div>
                <span>ВПРАВО</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center mb-8 text-xs text-gray-500">
              <div className="flex gap-6">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#4a9eff] inline-block"></span> Движущиеся платформы</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#ff6b3a] inline-block"></span> Рассыпающиеся</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#ff3355] inline-block"></span> Шипы</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-16 py-4 text-xl font-russo tracking-widest text-black rounded-lg transition-all duration-200 hover:scale-105 animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #63ffb4, #39d990)', boxShadow: '0 0 30px #63ffb450' }}
            >
              СТАРТ
            </button>

            <div className="mt-8 text-gray-600 text-xs tracking-wider">5 УРОВНЕЙ · ДИНАМИЧЕСКАЯ МУЗЫКА · ФИЗИКА</div>
          </div>
        </div>
      )}

      {ui.phase !== 'menu' && (
        <>
          {/* HUD */}
          <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-6 z-10 pointer-events-none">
            <div className="flex flex-col gap-1">
              <div className="text-xs tracking-[0.3em] opacity-50" style={{ color: accentColor }}>УРОВЕНЬ</div>
              <div className="font-russo text-3xl text-white">{ui.level + 1} <span className="text-base opacity-60">/ {LEVELS.length}</span></div>
              <div className="text-sm tracking-widest" style={{ color: accentColor }}>{ui.levelName}</div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="text-xs tracking-[0.3em] opacity-50 text-white">СЧЁТ</div>
              <div className="font-mono text-2xl text-white">{String(ui.score).padStart(6, '0')}</div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="text-xs tracking-[0.3em] opacity-50 text-white">ЖИЗНИ</div>
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-sm transition-all duration-300"
                    style={{
                      background: i < ui.lives ? accentColor : 'rgba(255,255,255,0.1)',
                      boxShadow: i < ui.lives ? `0 0 8px ${accentColor}` : 'none'
                    }} />
                ))}
              </div>
            </div>
          </div>

          {/* Level progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 z-10">
            <div className="h-full transition-all duration-300"
              style={{ width: `${((ui.level) / LEVELS.length) * 100}%`, background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
          </div>
        </>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="rounded-xl border"
        style={{
          borderColor: ui.phase === 'menu' ? 'transparent' : `${accentColor}30`,
          boxShadow: ui.phase === 'menu' ? 'none' : `0 0 60px ${accentColor}15, inset 0 0 60px rgba(0,0,0,0.5)`,
          maxWidth: '100vw',
          background: '#060b14'
        }}
      />

      {/* Touch controls */}
      {ui.phase === 'playing' && (
        <div className="flex gap-4 mt-6 md:hidden">
          <button
            onTouchStart={() => handleTouch('ArrowLeft', true)}
            onTouchEnd={() => handleTouch('ArrowLeft', false)}
            className="w-14 h-14 rounded-xl border text-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ borderColor: `${accentColor}40`, background: `${accentColor}10`, color: accentColor }}
          >←</button>
          <button
            onTouchStart={() => handleTouch('jump', true)}
            onTouchEnd={() => handleTouch('jump', false)}
            className="w-14 h-14 rounded-xl border text-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ borderColor: `${accentColor}60`, background: `${accentColor}20`, color: accentColor }}
          >↑</button>
          <button
            onTouchStart={() => handleTouch('ArrowRight', true)}
            onTouchEnd={() => handleTouch('ArrowRight', false)}
            className="w-14 h-14 rounded-xl border text-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ borderColor: `${accentColor}40`, background: `${accentColor}10`, color: accentColor }}
          >→</button>
        </div>
      )}

      {ui.phase === 'win' && (
        <button
          onClick={startGame}
          className="mt-6 px-12 py-3 font-russo text-lg tracking-widest text-black rounded-lg animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #63ffb4, #39d990)', boxShadow: '0 0 20px #63ffb440' }}
        >
          СНОВА
        </button>
      )}
    </div>
  );
}

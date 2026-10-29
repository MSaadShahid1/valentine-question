import { heartCurvePoint, heartPath2D } from './heart';
import { pick, rand } from './random';

type ParticleKind = 'heart' | 'sparkle' | 'petal' | 'ring' | 'dot' | 'emoji' | 'confetti';

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  /** Fraction of velocity kept per 1/60s frame. */
  drag: number;
  rotation: number;
  spin: number;
  size: number;
  age: number;
  life: number;
  delay: number;
  sprite?: HTMLCanvasElement;
  color: string;
  sway: number;
  phase: number;
  growth: number;
  /** Leaves a short sparkle trail (firework rockets). */
  trail?: boolean;
  /** Called when the particle dies (rockets explode here). */
  onExpire?: (p: Particle) => void;
}

export type BurstPreset =
  | 'heartPop'
  | 'paperHearts'
  | 'sparkles'
  | 'love'
  | 'celebration'
  | 'heartRain'
  | 'trail'
  | 'fireworks'
  | 'cannons'
  | 'poof'
  | 'emoji';

export interface BurstOptions {
  /** Glyphs for the `emoji` preset. */
  emoji?: string[];
}

export interface Palette {
  hearts: string[];
  paper: string[];
  sparkles: string[];
  petals: string[];
}

export interface Origin {
  x: number;
  y: number;
}

const SPRITE_SIZE = 64;

function makeCanvas(size = SPRITE_SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function heartSprite(color: string) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2 + 2);
  ctx.scale(0.58, 0.58);
  const path = heartPath2D();
  ctx.fillStyle = color;
  ctx.fill(path);
  // Soft glossy highlight so hearts read as little 3D candies rather than flat shapes.
  const gloss = ctx.createRadialGradient(-22, -22, 2, -14, -14, 46);
  gloss.addColorStop(0, 'rgba(255,255,255,0.65)');
  gloss.addColorStop(0.45, 'rgba(255,255,255,0.12)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gloss;
  ctx.fill(path);
  return canvas;
}

function sparkleSprite(color: string) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d')!;
  const c = SPRITE_SIZE / 2;
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
  glow.addColorStop(0, color);
  glow.addColorStop(0.18, color);
  glow.addColorStop(0.4, 'rgba(255,255,255,0.08)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  // Four-point twinkle star.
  ctx.moveTo(c, 2);
  ctx.quadraticCurveTo(c + 3, c - 3, SPRITE_SIZE - 2, c);
  ctx.quadraticCurveTo(c + 3, c + 3, c, SPRITE_SIZE - 2);
  ctx.quadraticCurveTo(c - 3, c + 3, 2, c);
  ctx.quadraticCurveTo(c - 3, c - 3, c, 2);
  ctx.fill();
  return canvas;
}

function petalSprite(color: string) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d')!;
  const c = SPRITE_SIZE / 2;
  const fill = ctx.createLinearGradient(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  fill.addColorStop(0, 'rgba(255,255,255,0.85)');
  fill.addColorStop(0.35, color);
  fill.addColorStop(1, color);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(c, 6);
  ctx.bezierCurveTo(SPRITE_SIZE - 6, 14, SPRITE_SIZE - 10, SPRITE_SIZE - 12, c, SPRITE_SIZE - 6);
  ctx.bezierCurveTo(10, SPRITE_SIZE - 12, 6, 14, c, 6);
  ctx.fill();
  return canvas;
}

function emojiSprite(glyph: string) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.font = '46px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, SPRITE_SIZE / 2, SPRITE_SIZE / 2 + 3);
  return canvas;
}

function confettiSprite(color: string) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(8, 22, 48, 20, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(8, 22, 48, 6);
  return canvas;
}

function dotSprite(color: string) {
  const canvas = makeCanvas(32);
  const ctx = canvas.getContext('2d')!;
  const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, '#fff');
  glow.addColorStop(0.25, color);
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 32, 32);
  return canvas;
}

/**
 * A single full-screen canvas that renders every burst on the site.
 * Particles are drawn from cached sprites; the loop sleeps when nothing is alive.
 */
export class ParticleEngine {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private frame = 0;
  private last = 0;
  private dpr = 1;
  private width = 0;
  private height = 0;
  private sprites = new Map<string, HTMLCanvasElement>();
  private reduced = false;
  private compact = false;
  private readonly canvas: HTMLCanvasElement;
  private readonly palette: Palette;
  /** Hook for a sound effect each time a firework bursts. */
  onExplode?: () => void;

  constructor(canvas: HTMLCanvasElement, palette: Palette) {
    this.canvas = canvas;
    this.palette = palette;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  setQuality({ reduced, compact }: { reduced: boolean; compact: boolean }) {
    this.reduced = reduced;
    this.compact = compact;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, this.compact ? 1.5 : 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
  }

  get busy() {
    return this.particles.length > 120;
  }

  clear() {
    this.particles = [];
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy() {
    this.clear();
    this.sprites.clear();
  }

  private sprite(kind: ParticleKind, color: string) {
    const key = `${kind}:${color}`;
    let sprite = this.sprites.get(key);
    if (!sprite) {
      const make = {
        heart: heartSprite,
        sparkle: sparkleSprite,
        petal: petalSprite,
        emoji: emojiSprite,
        confetti: confettiSprite,
        dot: dotSprite,
        ring: dotSprite,
      }[kind];
      sprite = make(color);
      this.sprites.set(key, sprite);
    }
    return sprite;
  }

  private get cap() {
    return this.compact ? 420 : 1100;
  }

  private add(kind: ParticleKind, color: string, init: Partial<Particle> & Pick<Particle, 'x' | 'y'>) {
    if (this.particles.length >= this.cap) return;
    this.particles.push({
      kind,
      color,
      vx: 0,
      vy: 0,
      gravity: 0,
      drag: 0.985,
      rotation: rand(-0.6, 0.6),
      spin: rand(-2, 2),
      size: 16,
      age: 0,
      life: 1.2,
      delay: 0,
      sway: 0,
      phase: rand(0, Math.PI * 2),
      growth: 0,
      sprite: kind === 'ring' ? undefined : this.sprite(kind, color),
      ...init,
    });
  }

  /** Radial burst helper: spawns `count` particles flying out from an origin. */
  private radial(
    kind: ParticleKind,
    colors: string[],
    origin: Origin,
    count: number,
    opts: {
      speed: [number, number];
      size: [number, number];
      life: [number, number];
      gravity?: number;
      drag?: number;
      angle?: number;
      spread?: number;
      delay?: [number, number];
    },
  ) {
    const n = Math.round(count * (this.compact ? 0.45 : 1));
    for (let i = 0; i < n; i += 1) {
      const angle = opts.angle !== undefined ? opts.angle + rand(-(opts.spread ?? Math.PI), opts.spread ?? Math.PI) : rand(0, Math.PI * 2);
      const speed = rand(...opts.speed);
      this.add(kind, pick(colors), {
        x: origin.x + rand(-6, 6),
        y: origin.y + rand(-6, 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(...opts.size),
        life: rand(...opts.life),
        gravity: opts.gravity ?? 0,
        drag: opts.drag ?? 0.985,
        delay: opts.delay ? rand(...opts.delay) : 0,
      });
    }
  }

  private ring(origin: Origin, color: string, delay: number, growth: number) {
    this.add('ring', color, { x: origin.x, y: origin.y, size: 30, growth, life: 1.3, delay, spin: 0, rotation: 0 });
  }

  burst(preset: BurstPreset, origin: Origin, options: BurstOptions = {}) {
    const { hearts, paper, sparkles, petals } = this.palette;

    if (this.reduced) {
      // Calm alternative: a handful of softly fading sparkles with almost no motion.
      if (preset === 'trail') return;
      for (let i = 0; i < 10; i += 1) {
        this.add(i % 2 ? 'heart' : 'sparkle', pick(i % 2 ? hearts : sparkles), {
          x: origin.x + rand(-60, 60),
          y: origin.y + rand(-40, 40),
          vx: rand(-6, 6),
          vy: rand(-12, -4),
          size: rand(12, 22),
          life: rand(1.4, 2),
          spin: 0,
        });
      }
      this.start();
      return;
    }

    switch (preset) {
      case 'trail':
        if (this.particles.length > 260) return;
        this.add(Math.random() < 0.3 ? 'heart' : 'sparkle', pick(Math.random() < 0.5 ? sparkles : hearts), {
          x: origin.x,
          y: origin.y,
          vx: rand(-20, 20),
          vy: rand(-40, -10),
          size: rand(6, 12),
          life: rand(0.5, 0.8),
          gravity: 30,
        });
        break;

      case 'heartPop':
        this.radial('heart', hearts, origin, 22, { speed: [120, 340], size: [10, 22], life: [0.9, 1.4], gravity: 260 });
        this.radial('sparkle', sparkles, origin, 12, { speed: [60, 220], size: [8, 16], life: [0.6, 1.1] });
        break;

      case 'paperHearts':
        this.radial('heart', paper, origin, 38, {
          speed: [180, 460],
          size: [12, 28],
          life: [1.4, 2.2],
          gravity: 240,
          angle: -Math.PI / 2,
          spread: Math.PI * 0.42,
        });
        this.radial('sparkle', sparkles, origin, 18, { speed: [60, 260], size: [8, 18], life: [0.8, 1.6], gravity: 20 });
        break;

      case 'sparkles': {
        const points = [origin, ...Array.from({ length: 5 }, () => ({ x: rand(0.1, 0.9) * this.width, y: rand(0.15, 0.75) * this.height }))];
        points.forEach((point, i) => {
          this.radial('sparkle', sparkles, point, 26, {
            speed: [30, 240],
            size: [8, 24],
            life: [1, 1.9],
            gravity: 20,
            delay: [i * 0.08, i * 0.08 + 0.15],
          });
          this.radial('dot', sparkles, point, 10, { speed: [20, 160], size: [4, 9], life: [0.8, 1.5], delay: [i * 0.08, i * 0.08 + 0.2] });
        });
        break;
      }

      case 'love':
        this.radial('heart', hearts, origin, 54, {
          speed: [280, 640],
          size: [12, 30],
          life: [1.4, 2.2],
          gravity: 560,
          angle: -Math.PI / 2,
          spread: Math.PI * 0.26,
        });
        this.ring(origin, hearts[0], 0, 520);
        this.ring(origin, sparkles[0], 0.12, 380);
        break;

      case 'celebration':
        this.radial('heart', hearts, origin, 230, { speed: [240, 1100], size: [10, 34], life: [1.6, 2.8], gravity: 220, drag: 0.94 });
        this.radial('heart', paper, origin, 40, { speed: [200, 800], size: [10, 22], life: [1.6, 2.6], gravity: 200, drag: 0.95 });
        this.radial('sparkle', sparkles, origin, 120, { speed: [120, 900], size: [8, 24], life: [1, 2], gravity: 60, drag: 0.94 });
        this.radial('dot', sparkles, origin, 50, { speed: [80, 700], size: [4, 10], life: [0.9, 1.8], drag: 0.95 });
        [0, 0.14, 0.3, 0.5].forEach((delay, i) => this.ring(origin, i % 2 ? sparkles[0] : hearts[1], delay, 900 + i * 180));
        this.rain(petals, 46, 'petal', 3.2);
        break;

      case 'heartRain':
        this.rain(hearts, 70, 'heart', 3.4);
        this.rain(petals, 28, 'petal', 3.4);
        break;

      case 'fireworks': {
        const rockets = this.compact ? 5 : 8;
        for (let i = 0; i < rockets; i += 1) this.rocket(rand(0.12, 0.88) * this.width, i * rand(0.3, 0.5));
        break;
      }

      case 'cannons':
        this.cannon(0, 1);
        this.cannon(this.width, -1);
        break;

      case 'poof':
        this.radial('dot', ['#FFF8F5', '#C9A7FF', '#FFE1EA'], origin, 18, { speed: [40, 160], size: [18, 42], life: [0.45, 0.8], drag: 0.9 });
        this.radial('heart', hearts, origin, 8, { speed: [80, 220], size: [8, 14], life: [0.6, 1], gravity: 120 });
        break;

      case 'emoji': {
        const glyphs = options.emoji?.length ? options.emoji : ['💗'];
        this.radial('emoji', glyphs, origin, 20, { speed: [220, 560], size: [26, 46], life: [1.3, 2], gravity: 520 });
        this.radial('heart', hearts, origin, 14, { speed: [160, 420], size: [10, 20], life: [1, 1.6], gravity: 420 });
        this.radial('sparkle', sparkles, origin, 14, { speed: [80, 320], size: [8, 18], life: [0.7, 1.3] });
        break;
      }
    }
    this.start();
  }

  /** A firework rocket: rises with a sparkle trail and bursts at its apex. */
  private rocket(x: number, delay: number) {
    const gravity = 520;
    const apex = rand(0.12, 0.4) * this.height;
    const startY = this.height + 10;
    const vy = -Math.sqrt(2 * gravity * (startY - apex));
    // Saturated colours only, so bursts read on the dark sky and the bright sunrise alike.
    const color = pick([...this.palette.hearts.slice(0, 4), '#B07CFF', '#FFB020', '#FF5C8A']);
    this.add('dot', '#FFF3C4', {
      x,
      y: startY,
      vx: rand(-30, 30),
      vy,
      gravity,
      drag: 1,
      size: 12,
      life: -vy / gravity,
      delay,
      spin: 0,
      trail: true,
      onExpire: (p) => this.explode(p.x, p.y, color),
    });
  }

  private explode(x: number, y: number, color: string) {
    this.onExplode?.();
    const n = this.compact ? 34 : 64;
    const style = pick(['heart', 'heart', 'ring', 'willow'] as const);
    for (let i = 0; i < n; i += 1) {
      if (style === 'heart') {
        // Velocities traced along a heart curve make the burst bloom into a heart shape.
        const point = heartCurvePoint((i / n) * Math.PI * 2);
        const speed = this.compact ? 190 : 250;
        this.add('sparkle', color, { x, y, vx: point.x * speed + rand(-6, 6), vy: point.y * speed + rand(-6, 6), drag: 0.955, gravity: 40, size: rand(10, 16), life: rand(1.3, 1.7), spin: 0 });
      } else if (style === 'ring') {
        const angle = (i / n) * Math.PI * 2;
        this.add('dot', color, { x, y, vx: Math.cos(angle) * 260, vy: Math.sin(angle) * 260, drag: 0.95, gravity: 60, size: rand(8, 13), life: rand(1.1, 1.5) });
      } else {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(60, 300);
        this.add('sparkle', pick(this.palette.sparkles), { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, drag: 0.968, gravity: 150, size: rand(8, 14), life: rand(1.8, 2.5), spin: 0 });
      }
    }
    this.add('dot', '#FFF8F5', { x, y, size: 140, life: 0.35 });
  }

  /** Confetti cannon firing from a bottom corner (direction 1 = rightwards). */
  private cannon(x: number, direction: 1 | -1) {
    const n = Math.round(70 * (this.compact ? 0.5 : 1));
    for (let i = 0; i < n; i += 1) {
      const angle = -Math.PI / 2 + direction * rand(0.12, 0.62);
      const speed = rand(650, 1250) * (this.compact ? 0.75 : 1);
      const roll = Math.random();
      const kind: ParticleKind = roll < 0.6 ? 'confetti' : roll < 0.85 ? 'heart' : 'sparkle';
      const colors =
        kind === 'sparkle' ? this.palette.sparkles : kind === 'heart' ? this.palette.hearts : [...this.palette.hearts, ...this.palette.sparkles, '#C9A7FF'];
      this.add(kind, pick(colors), {
        x,
        y: this.height + 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 720,
        drag: 0.982,
        size: kind === 'confetti' ? rand(12, 20) : rand(10, 22),
        life: rand(2.2, 3.2),
        delay: rand(0, 0.25),
        spin: rand(-6, 6),
        sway: kind === 'confetti' ? rand(10, 40) : 0,
      });
    }
  }

  private rain(colors: string[], count: number, kind: ParticleKind, spreadSeconds: number) {
    const n = Math.round(count * (this.compact ? 0.45 : 1));
    for (let i = 0; i < n; i += 1) {
      this.add(kind, pick(colors), {
        x: rand(0, this.width),
        y: rand(-60, -20),
        vx: rand(-30, 30),
        vy: rand(60, 170),
        gravity: rand(10, 40),
        drag: 0.995,
        size: kind === 'petal' ? rand(12, 22) : rand(10, 24),
        life: rand(4.5, 6.5),
        delay: rand(0, spreadSeconds),
        sway: rand(30, 70),
        spin: rand(-1.5, 1.5),
      });
    }
  }

  private start() {
    if (this.frame) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const { ctx, dpr } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const alive: Particle[] = [];
    const expired: Particle[] = [];
    const trails: Origin[] = [];
    for (const p of this.particles) {
      if (p.delay > 0) {
        p.delay -= dt;
        alive.push(p);
        continue;
      }
      p.age += dt;
      if (p.age >= p.life) {
        if (p.onExpire) expired.push(p);
        continue;
      }
      alive.push(p);
      if (p.trail) trails.push({ x: p.x, y: p.y });

      const keep = Math.pow(p.drag, dt * 60);
      p.vx *= keep;
      p.vy = p.vy * keep + p.gravity * dt;
      p.phase += dt * 3;
      p.x += (p.vx + Math.sin(p.phase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;

      const t = p.age / p.life;
      const alpha = t < 0.08 ? t / 0.08 : t > 0.62 ? Math.max(0, (1 - t) / 0.38) : 1;
      ctx.globalAlpha = alpha;

      if (p.kind === 'ring') {
        const scale = (p.size + p.growth * Math.sqrt(t)) / 100;
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * p.x, dpr * p.y);
        ctx.lineWidth = (3.5 * (1 - t) + 0.5) / scale;
        ctx.strokeStyle = p.color;
        ctx.stroke(heartPath2D());
        continue;
      }

      // Petals flutter by squashing horizontally to fake a 3D tumble.
      const flutter = p.kind === 'petal' || p.kind === 'confetti' ? Math.cos(p.phase * 1.6) : 1;
      const cos = Math.cos(p.rotation);
      const sin = Math.sin(p.rotation);
      ctx.setTransform(dpr * cos * flutter, dpr * sin * flutter, -dpr * sin, dpr * cos, dpr * p.x, dpr * p.y);
      const s = p.size;
      ctx.drawImage(p.sprite!, -s / 2, -s / 2, s, s);
    }

    this.particles = alive;
    ctx.globalAlpha = 1;
    // Spawned after the pass so the list is never mutated mid-iteration.
    for (const t of trails) {
      this.add('sparkle', pick(this.palette.sparkles), { x: t.x + rand(-3, 3), y: t.y, vx: rand(-20, 20), vy: rand(10, 50), size: rand(6, 11), life: rand(0.3, 0.55), spin: 0 });
    }
    for (const p of expired) p.onExpire?.(p);
    if (this.particles.length > 0) {
      this.frame = requestAnimationFrame(this.tick);
    } else {
      this.frame = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };
}

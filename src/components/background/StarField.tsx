import { useEffect, useRef } from 'react';
import { usePointer } from '../../context/PointerContext';
import { rand } from '../../utils/random';

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  depth: number;
  appear: number;
  sprite: number;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

interface StarFieldProps {
  /** Stars fade in one by one (used for the opening scene). */
  reveal: boolean;
  reduced: boolean;
  compact: boolean;
}

const COLORS = ['255,248,245', '255,248,245', '255,248,245', '255,182,210', '255,229,160', '201,167,255'];

function glowSprite(rgb: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.2, `rgba(${rgb},0.85)`);
  g.addColorStop(0.5, `rgba(${rgb},0.15)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return canvas;
}

/** Twinkling stars and drifting dust on one canvas — far cheaper than hundreds of DOM nodes. */
export function StarField({ reveal, reduced, compact }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = usePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const sprites = COLORS.map(glowSprite);
    const starCount = compact ? 95 : 180;
    const stars: Star[] = Array.from({ length: starCount }, () => {
      const bright = Math.random() < 0.08;
      return {
        x: Math.random(),
        y: Math.random() ** 1.25,
        r: bright ? rand(1.6, 2.6) : rand(0.4, 1.3),
        base: bright ? rand(0.75, 1) : rand(0.25, 0.75),
        speed: rand(0.6, 2.2),
        phase: rand(0, Math.PI * 2),
        depth: rand(0.2, 1),
        appear: reveal ? rand(0.1, 3.6) : 0,
        sprite: Math.floor(Math.random() * COLORS.length),
      };
    });
    const dust: Dust[] = Array.from({ length: compact ? 12 : 26 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: rand(-0.004, 0.004),
      vy: rand(-0.012, -0.004),
      r: rand(1, 2.6),
      alpha: rand(0.12, 0.35),
    }));

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();

    const start = performance.now();
    let frame = 0;
    let last = start;
    // Occasional shooting stars streak across the sky.
    const meteors: Array<{ x: number; y: number; vx: number; vy: number; age: number; life: number; length: number }> = [];
    let nextMeteor = rand(1.5, 3.5);

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const px = pointer.x.get() * 14;
      const py = pointer.y.get() * 10;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        const appear = reduced ? 1 : Math.min(1, Math.max(0, (t - s.appear) / 1.4));
        if (appear <= 0) continue;
        const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * s.speed + s.phase);
        ctx.globalAlpha = s.base * twinkle * appear;
        const size = s.r * 7;
        ctx.drawImage(sprites[s.sprite], s.x * width - px * s.depth - size / 2, s.y * height - py * s.depth - size / 2, size, size);
      }

      for (const d of dust) {
        if (!reduced) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          if (d.y < -0.05) {
            d.y = 1.05;
            d.x = Math.random();
          }
          if (d.x < -0.05) d.x = 1.05;
          if (d.x > 1.05) d.x = -0.05;
        }
        ctx.globalAlpha = d.alpha * Math.min(1, t / 2);
        const size = d.r * 8;
        ctx.drawImage(sprites[3], d.x * width - px * 1.4 - size / 2, d.y * height - py * 1.4 - size / 2, size, size);
      }

      if (!reduced) {
        nextMeteor -= dt;
        if (nextMeteor <= 0) {
          nextMeteor = rand(2.4, 5.5);
          const dir = Math.random() < 0.5 ? -1 : 1;
          const angle = rand(0.35, 0.6);
          const speed = rand(700, 1100);
          meteors.push({
            x: rand(0.15, 0.85) * width,
            y: rand(0.02, 0.35) * height,
            vx: Math.cos(angle) * speed * dir,
            vy: Math.sin(angle) * speed,
            age: 0,
            life: rand(0.7, 1.1),
            length: rand(110, 220),
          });
        }
        for (let i = meteors.length - 1; i >= 0; i -= 1) {
          const m = meteors[i];
          m.age += dt;
          if (m.age >= m.life) {
            meteors.splice(i, 1);
            continue;
          }
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          const speed = Math.hypot(m.vx, m.vy);
          const tailX = m.x - (m.vx / speed) * m.length;
          const tailY = m.y - (m.vy / speed) * m.length;
          const streak = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          streak.addColorStop(0, 'rgba(255, 248, 245, 0.95)');
          streak.addColorStop(0.3, 'rgba(255, 182, 210, 0.45)');
          streak.addColorStop(1, 'rgba(255, 130, 178, 0)');
          ctx.globalAlpha = Math.sin((m.age / m.life) * Math.PI);
          ctx.strokeStyle = streak;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          ctx.drawImage(sprites[0], m.x - 9, m.y - 9, 18, 18);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const run = () => {
      cancelAnimationFrame(frame);
      if (document.hidden) return;
      if (reduced) {
        draw(performance.now() + 10_000);
      } else {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    };

    const onResize = () => {
      resize();
      if (reduced) draw(performance.now() + 10_000);
    };

    run();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', run);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', run);
    };
    // `reveal` only matters for the very first paint, so it is deliberately not a dependency.
  }, [reduced, compact, pointer]);

  return <canvas ref={canvasRef} className="bg__stars" aria-hidden="true" />;
}

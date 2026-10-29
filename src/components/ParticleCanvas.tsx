import { useEffect, useRef } from 'react';
import { valentineConfig } from '../config/valentine';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { ParticleEngine } from '../utils/particles';

const { theme } = valentineConfig;

const PALETTE = {
  hearts: [theme.crimson, theme.bubblegum, '#FF5C8A', '#E0306A', '#FFB3CF'],
  paper: [theme.ivory, theme.blush, '#FFD3E0', theme.bubblegum],
  sparkles: [theme.gold, '#FFF3C4', theme.blush, theme.lavender, theme.bubblegum],
  petals: ['#FF7FA3', '#F04468', '#FFB3CF', '#E8476F'],
};

/** Hosts the single full-screen particle canvas and hands its engine to the effects context. */
export function ParticleCanvas({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const effects = useEffects();
  const sound = useSound();
  const playRef = useRef(sound.play);
  playRef.current = sound.play;

  useEffect(() => {
    const engine = new ParticleEngine(canvasRef.current!, PALETTE);
    engineRef.current = engine;
    engine.onExplode = () => playRef.current('firework');
    effects.registerEngine(engine);
    const onResize = () => engine.resize();
    const onVisibility = () => {
      if (document.hidden) engine.clear();
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      effects.registerEngine(null);
      engine.destroy();
      engineRef.current = null;
    };
  }, [effects]);

  useEffect(() => {
    engineRef.current?.setQuality({ reduced, compact });
  }, [reduced, compact]);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}

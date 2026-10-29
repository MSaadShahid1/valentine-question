import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import type { BurstOptions, BurstPreset, FlashKind, Origin, ParticleEngine } from '../utils/particles';

interface EffectsApi {
  /** Fire a particle burst from a point or from the centre of an element. */
  burst: (preset: BurstPreset, target: Origin | Element | null | undefined, options?: BurstOptions) => void;
  /** Full-screen transition flash (light wash + a heart blooming toward the viewer), drawn on the particle canvas. */
  flash: (kind: FlashKind, target?: Origin | Element | null) => void;
  /** A short camera shake for big moments (skipped for reduced motion). */
  shake: () => void;
  /** Wipe every particle and flash, used by Replay. */
  clear: () => void;
  registerEngine: (engine: ParticleEngine | null) => void;
  isBusy: () => boolean;
}

const EffectsContext = createContext<EffectsApi | null>(null);

export function centerOf(target: Origin | Element | null | undefined): Origin {
  if (!target) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  if (target instanceof Element) {
    const rect = target.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  return target;
}

export function EffectsProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<ParticleEngine | null>(null);
  const shakeTimer = useRef(0);

  const api = useMemo<EffectsApi>(
    () => ({
      burst: (preset, target, options) => engineRef.current?.burst(preset, centerOf(target), options),
      flash: (kind, target) => engineRef.current?.flash(kind, centerOf(target)),
      shake: () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const root = document.documentElement;
        root.classList.remove('is-shaking');
        void root.offsetWidth;
        root.classList.add('is-shaking');
        window.clearTimeout(shakeTimer.current);
        shakeTimer.current = window.setTimeout(() => root.classList.remove('is-shaking'), 700);
      },
      clear: () => {
        engineRef.current?.clear();
        window.clearTimeout(shakeTimer.current);
        document.documentElement.classList.remove('is-shaking');
      },
      registerEngine: (engine) => {
        engineRef.current = engine;
      },
      isBusy: () => engineRef.current?.busy ?? false,
    }),
    [],
  );

  return <EffectsContext.Provider value={api}>{children}</EffectsContext.Provider>;
}

export function useEffects() {
  const value = useContext(EffectsContext);
  if (!value) throw new Error('useEffects must be used inside <EffectsProvider>');
  return value;
}

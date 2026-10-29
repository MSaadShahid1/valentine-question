import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { BurstOptions, BurstPreset, Origin, ParticleEngine } from '../utils/particles';

export type FlashKind = 'hearts' | 'yes';

export interface Flash {
  id: number;
  kind: FlashKind;
  origin: Origin;
}

interface EffectsApi {
  /** Fire a particle burst from a point or from the centre of an element. */
  burst: (preset: BurstPreset, target: Origin | Element | null | undefined, options?: BurstOptions) => void;
  /** Full-screen transition flash (expanding hearts + light). */
  flash: (kind: FlashKind, target?: Origin | Element | null) => void;
  /** A short camera shake for big moments (skipped for reduced motion). */
  shake: () => void;
  /** Wipe every particle and flash, used by Replay. */
  clear: () => void;
  registerEngine: (engine: ParticleEngine | null) => void;
  isBusy: () => boolean;
}

const EffectsContext = createContext<EffectsApi | null>(null);
const FlashContext = createContext<Flash[]>([]);

export const FLASH_DURATION: Record<FlashKind, number> = { hearts: 1300, yes: 1900 };

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
  const timers = useRef(new Set<number>());
  const nextId = useRef(0);
  const [flashes, setFlashes] = useState<Flash[]>([]);

  const flash = useCallback((kind: FlashKind, target?: Origin | Element | null) => {
    const id = (nextId.current += 1);
    setFlashes((list) => [...list, { id, kind, origin: centerOf(target) }]);
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      setFlashes((list) => list.filter((item) => item.id !== id));
    }, FLASH_DURATION[kind]);
    timers.current.add(timer);
  }, []);

  const api = useMemo<EffectsApi>(
    () => ({
      burst: (preset, target, options) => engineRef.current?.burst(preset, centerOf(target), options),
      flash,
      shake: () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const root = document.documentElement;
        root.classList.remove('is-shaking');
        void root.offsetWidth;
        root.classList.add('is-shaking');
        const timer = window.setTimeout(() => root.classList.remove('is-shaking'), 700);
        timers.current.add(timer);
      },
      clear: () => {
        engineRef.current?.clear();
        timers.current.forEach((timer) => window.clearTimeout(timer));
        timers.current.clear();
        setFlashes([]);
      },
      registerEngine: (engine) => {
        engineRef.current = engine;
      },
      isBusy: () => engineRef.current?.busy ?? false,
    }),
    [flash],
  );

  return (
    <EffectsContext.Provider value={api}>
      <FlashContext.Provider value={flashes}>{children}</FlashContext.Provider>
    </EffectsContext.Provider>
  );
}

export function useEffects() {
  const value = useContext(EffectsContext);
  if (!value) throw new Error('useEffects must be used inside <EffectsProvider>');
  return value;
}

export function useFlashes() {
  return useContext(FlashContext);
}

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'motion/react';

interface PointerValues {
  /** Smoothed pointer position, normalised to -1…1 across the viewport. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** Raw pointer position in CSS pixels (mouse/pen only). */
  clientX: MotionValue<number>;
  clientY: MotionValue<number>;
}

const PointerContext = createContext<PointerValues | null>(null);

export function PointerProvider({ children }: { children: ReactNode }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const clientX = useMotionValue(-400);
  const clientY = useMotionValue(-400);
  const x = useSpring(rawX, { stiffness: 50, damping: 18, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 50, damping: 18, mass: 0.8 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      // Touch "moves" are drags or taps — parallax only follows a real cursor.
      if (event.pointerType === 'touch') return;
      clientX.set(event.clientX);
      clientY.set(event.clientY);
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [rawX, rawY, clientX, clientY]);

  return <PointerContext.Provider value={{ x, y, clientX, clientY }}>{children}</PointerContext.Provider>;
}

export function usePointer() {
  const value = useContext(PointerContext);
  if (!value) throw new Error('usePointer must be used inside <PointerProvider>');
  return value;
}

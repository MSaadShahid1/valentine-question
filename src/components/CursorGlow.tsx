import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { useEffects } from '../context/EffectsContext';
import { usePointer } from '../context/PointerContext';

/** Soft pink light that trails the cursor, plus an occasional sparkle. Desktop only. */
export function CursorGlow() {
  const { clientX, clientY } = usePointer();
  const x = useSpring(clientX, { stiffness: 260, damping: 28, mass: 0.6 });
  const y = useSpring(clientY, { stiffness: 260, damping: 28, mass: 0.6 });
  const effects = useEffects();
  const [visible, setVisible] = useState(false);
  const last = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      setVisible(true);
      const now = performance.now();
      const dx = event.clientX - last.current.x;
      const dy = event.clientY - last.current.y;
      // Only a quick, deliberate movement leaves a sparkle — never a constant stream.
      if (now - last.current.t > 70 && Math.hypot(dx, dy) > 34) {
        last.current = { x: event.clientX, y: event.clientY, t: now };
        if (Math.random() < 0.55 && !effects.isBusy()) effects.burst('trail', { x: event.clientX, y: event.clientY });
      }
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [effects]);

  return <motion.div className="cursor-glow" style={{ x, y, opacity: visible ? 1 : 0 }} aria-hidden="true" />;
}

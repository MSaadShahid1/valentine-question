import { forwardRef, type ReactNode } from 'react';
import { motion, useIsPresent, type Variants } from 'motion/react';
import { useMotionPreferences } from '../hooks/useReducedMotion';

export type TransitionStyle = 'fade' | 'rise' | 'zoom' | 'bloom';

interface SceneTransitionProps {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  style?: TransitionStyle;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// `filter` always settles on `none` so no blur lingers on the scroll container.
const VARIANTS: Record<TransitionStyle, Variants> = {
  fade: {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.6, ease: EASE } },
  },
  rise: {
    initial: { opacity: 0, y: 48, scale: 0.94, filter: 'blur(10px)' },
    enter: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 1.1, ease: EASE, delay: 0.15 }, transitionEnd: { filter: 'none' } },
    exit: { opacity: 0, y: -30, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.6, ease: EASE } },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.9, filter: 'blur(12px)' },
    enter: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1, ease: EASE }, transitionEnd: { filter: 'none' } },
    exit: { opacity: 0, scale: 1.3, filter: 'blur(14px)', transition: { duration: 0.8, ease: [0.55, 0, 0.75, 0.2] } },
  },
  bloom: {
    initial: { opacity: 0, scale: 1.08, filter: 'blur(16px) brightness(1.6)' },
    enter: { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', transition: { duration: 1.3, ease: EASE, delay: 0.2 }, transitionEnd: { filter: 'none' } },
    exit: { opacity: 0, filter: 'blur(10px)', transition: { duration: 0.7, ease: EASE } },
  },
};

const LITE: Variants = VARIANTS.fade;

/**
 * Wraps a scene: animates its entrance/exit and makes the outgoing scene inert
 * so it can't be clicked or tabbed into while it fades away.
 */
export const SceneTransition = forwardRef<HTMLElement, SceneTransitionProps>(function SceneTransition(
  { children, className = '', labelledBy, style = 'rise' },
  ref,
) {
  const isPresent = useIsPresent();
  const { reduced, compact } = useMotionPreferences();
  // Full-screen blur is costly on phones; they get the same choreography without the filter.
  let variants = reduced ? LITE : VARIANTS[style];
  if (compact && !reduced) {
    variants = Object.fromEntries(
      Object.entries(variants).map(([key, value]) => {
        const { filter: _filter, transitionEnd: _end, ...rest } = value as Record<string, unknown>;
        return [key, rest];
      }),
    ) as Variants;
  }

  return (
    <motion.section
      ref={ref}
      className={`scene ${className}`}
      aria-labelledby={labelledBy}
      inert={!isPresent}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.section>
  );
});

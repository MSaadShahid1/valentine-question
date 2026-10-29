import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { AnimatePresence, animate, motion, useAnimate, useMotionValue, useSpring } from 'motion/react';
import { useEffects } from '../context/EffectsContext';
import { useSound } from '../context/SoundContext';
import { distanceToBox, findDodgeOffset, inflate, intersectBoxes, type Box, type Point } from '../utils/dodge';
import { createRotation } from '../utils/random';
import { HeartShape } from './HeartShape';
import { Portal } from './Portal';
import { SpeechBubble, type BubblePlacement } from './SpeechBubble';
import './no-button.css';

const SPRING = { stiffness: 260, damping: 18, mass: 0.7 };
/** While the cursor lingers nearby the button keeps fleeing, but no faster than this. */
const FLEE_INTERVAL = 240;

interface Ghost {
  id: number;
  x: number;
  y: number;
}

interface NoButtonProps {
  /** Labels cycled as the button keeps escaping. */
  labels: string[];
  messages: string[];
  /** Area the button may roam inside (the hero). */
  boundsRef: RefObject<HTMLElement | null>;
  /**
   * Controls the button must never land on (YES, links). A click aimed at the
   * fleeing NO lands on whatever is underneath, so nothing clickable may be there.
   */
  avoidRefs: Array<RefObject<HTMLElement | null>>;
  disabled?: boolean;
  /** Called on every escape with the running number of attempts. */
  onEscape: (attempts: number) => void;
}

const toBox = (rect: DOMRect): Box => ({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
const centerOf = (rect: DOMRect): Point => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

/**
 * The uncatchable NO button. It flees the cursor, dodges taps, teleports in a
 * puff of smoke, spins, shrinks and cycles cheeky labels — forever. A click or
 * key press that lands on it only makes it escape again; the only way forward
 * is the (ever-growing) YES button.
 */
export function NoButton({ labels, messages, boundsRef, avoidRefs, disabled = false, onEscape }: NoButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [faceRef, animateFace] = useAnimate<HTMLSpanElement>();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const scale = useMotionValue(1);
  const spin = useMotionValue(0);
  const effects = useEffects();
  const sound = useSound();

  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [placement, setPlacement] = useState<BubblePlacement>({ vertical: 'above', align: 'center' });
  const [ghosts, setGhosts] = useState<Ghost[]>([]);

  const attemptsRef = useRef(0);
  const lastEscape = useRef(0);
  const teleporting = useRef(false);
  const timers = useRef(new Set<number>());
  const messageTimer = useRef(0);
  const nextMessage = useMemo(() => createRotation(messages), [messages]);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  };

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const safeBounds = (): Box => {
    const viewport: Box = { left: 12, top: 76, right: window.innerWidth - 12, bottom: window.innerHeight - 12 };
    const hero = boundsRef.current?.getBoundingClientRect();
    return hero ? intersectBoxes(viewport, inflate(toBox(hero), -8)) : viewport;
  };

  const say = (text: string) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const center = rect.left + rect.width / 2;
      const vw = window.innerWidth;
      setPlacement({
        vertical: rect.top < 150 ? 'below' : 'above',
        align: center < vw * 0.3 ? 'start' : center > vw * 0.7 ? 'end' : 'center',
      });
    }
    setMessage(text);
    window.clearTimeout(messageTimer.current);
    messageTimer.current = later(() => setMessage(null), 2200);
  };

  const target = (min: number, max: number, pointer?: Point): Point => {
    const button = buttonRef.current;
    if (!button) return { x: x.get(), y: y.get() };
    const rect = button.getBoundingClientRect();
    const offset = { x: x.get(), y: y.get() };
    // Layout size ignores transforms, so this stays correct mid-teleport (scale 0) or mid-spin.
    const w = button.offsetWidth;
    const h = button.offsetHeight;
    const cx = rect.left + rect.width / 2 - offset.x;
    const cy = rect.top + rect.height / 2 - offset.y;
    const home: Box = { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 };
    const avoid = avoidRefs.flatMap((ref) => (ref.current ? [inflate(toBox(ref.current.getBoundingClientRect()), 20)] : []));
    const input = { home, offset, bounds: safeBounds(), avoid, pointer };
    const next = findDodgeOffset({ ...input, minDistance: min, maxDistance: max });
    // Cornered? Try a much bigger leap before giving up.
    if (next.x === offset.x && next.y === offset.y) return findDodgeOffset({ ...input, minDistance: 160, maxDistance: 520 });
    return next;
  };

  const leaveGhost = (rect: DOMRect) => {
    const ghost = { id: performance.now(), ...centerOf(rect) };
    setGhosts((list) => [...list.slice(-3), ghost]);
    later(() => setGhosts((list) => list.filter((g) => g.id !== ghost.id)), 1900);
  };

  const restingScale = (n: number) => Math.max(0.74, 1 - n * 0.025);

  const teleport = async (pointer: Point | undefined, n: number) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    teleporting.current = true;
    effects.burst('poof', centerOf(rect));
    leaveGhost(rect);
    await animate(scale, 0, { duration: 0.14, ease: 'easeIn' });
    const next = target(180, 460, pointer);
    x.jump(next.x);
    y.jump(next.y);
    spin.jump(-90);
    requestAnimationFrame(() => {
      const after = buttonRef.current?.getBoundingClientRect();
      if (after) effects.burst('poof', centerOf(after));
    });
    animate(spin, 0, { type: 'spring', stiffness: 300, damping: 14 });
    await animate(scale, restingScale(n), { type: 'spring', stiffness: 420, damping: 14 });
    teleporting.current = false;
  };

  const escape = (pointer?: Point, force = false) => {
    const now = performance.now();
    if (disabled || teleporting.current) return;
    if (!force && now - lastEscape.current < FLEE_INTERVAL) return;
    lastEscape.current = now;

    const n = attemptsRef.current + 1;
    attemptsRef.current = n;
    setAttempts(n);

    if (n >= 4 && n % 4 === 0) {
      void teleport(pointer, n);
    } else {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect && n >= 3 && n % 3 === 0) leaveGhost(rect);
      const next = n === 1 ? target(55, 95, pointer) : n === 2 ? target(100, 190, pointer) : target(130, 280, pointer);
      x.set(next.x);
      y.set(next.y);
      animate(scale, restingScale(n), { type: 'spring', stiffness: 400, damping: 15 });
      if (n % 5 === 0) {
        spin.jump(0);
        animate(spin, 360, { duration: 0.55, ease: [0.22, 1, 0.36, 1] }).then(() => spin.jump(0));
      }
      if (faceRef.current) {
        void animateFace(faceRef.current, { rotate: [0, -16, 12, -8, 4, 0], scale: [1, 1.12, 1] }, { duration: 0.5 });
      }
    }

    say(nextMessage());
    sound.play('boop');
    onEscape(n);
  };

  // Keep the latest closure for the window listener without re-subscribing every render.
  const escapeRef = useRef(escape);
  escapeRef.current = escape;

  useEffect(() => {
    if (disabled) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pointer = { x: event.clientX, y: event.clientY };
      // The flee radius grows as the button gets more paranoid.
      const radius = 70 + Math.min(attemptsRef.current * 4, 50);
      if (distanceToBox(pointer, toBox(rect)) < radius) escapeRef.current(pointer);
    };
    const onResize = () => {
      x.jump(0);
      y.jump(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [disabled, x, y]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // A finger or cursor that reaches it only scares it off again.
    escape({ x: event.clientX, y: event.clientY }, true);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Keyboard activation (no pointer involved): teleport away too.
    if (event.detail === 0) escape(undefined, true);
  };

  const label = labels.length ? labels[attempts % labels.length] : 'NO';

  return (
    <>
      <motion.div className="no-button" style={{ x, y, scale, rotate: spin }} data-restless={attempts >= 3 || undefined}>
        <SpeechBubble message={message} placement={placement} />
        <button
          ref={buttonRef}
          type="button"
          className="btn btn--ghost no-button__btn"
          aria-label="No"
          aria-describedby="no-button-status"
          disabled={disabled}
          onPointerDown={handlePointerDown}
          onClick={handleClick}
        >
          <span className="no-button__jitter">
            {/* Every label shares one grid cell, so the button never changes width mid-dodge. */}
            <span ref={faceRef} className="no-button__face">
              {labels.map((text) => (
                <span key={text} className={text === label ? undefined : 'is-hidden'}>
                  {text}
                </span>
              ))}
            </span>
          </span>
        </button>
      </motion.div>

      <span id="no-button-status" className="sr-only" aria-live="polite">
        {message ?? ''}
      </span>

      <Portal>
        <AnimatePresence>
          {ghosts.map((ghost) => (
            <motion.div
              key={ghost.id}
              className="no-ghost"
              style={{ left: ghost.x, top: ghost.y }}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.3, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.15, 1, 0.9], y: [0, -6, -18, -46] }}
              transition={{ duration: 1.8, times: [0, 0.15, 0.6, 1], ease: 'easeOut' }}
            >
              <HeartShape className="no-ghost__heart" />
              <span className="no-ghost__label">nope!</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </Portal>
    </>
  );
}

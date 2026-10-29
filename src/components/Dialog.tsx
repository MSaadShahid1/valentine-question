import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { Portal } from './Portal';
import './dialog.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  /** Extra key handling (e.g. arrow keys in the lightbox). */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: focus moves inside on open, Tab is trapped, Escape and the
 * backdrop close it, and focus returns to whatever opened it.
 */
export function Dialog({ open, onClose, labelledBy, children, className = '', onKeyDown }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus({ preventScroll: true });
    }, 60);
    return () => {
      window.clearTimeout(id);
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key === 'Tab' && panelRef.current) {
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    onKeyDown?.(event);
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="dialog" onKeyDown={handleKeyDown}>
            <motion.div
              className="dialog__backdrop"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              ref={panelRef}
              className={`dialog__panel ${className}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.7, y: 30, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.22 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <button type="button" className="dialog__close" onClick={onClose} aria-label="Close">
                <X size={20} aria-hidden="true" />
              </button>
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

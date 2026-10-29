import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders overlays at the document root so fixed positioning is never trapped
 * inside a transformed/filtered scene container.
 */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

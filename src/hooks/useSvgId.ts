import { useId } from 'react';

/** useId() output contains characters that are awkward inside SVG `url(#…)` references. */
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

import { valentineConfig } from '../config/valentine';

const TOKEN = /\{(recipient|sender)(?:\|([^}]*))?\}/g;

/** Replace `{recipient}`, `{sender}` and `{recipient|fallback}` tokens with configured names. */
export function personalize(text: string): string {
  return text
    .replace(TOKEN, (_match, key: 'recipient' | 'sender', fallback?: string) => {
      const name = (key === 'recipient' ? valentineConfig.recipientName : valentineConfig.senderName).trim();
      return name || fallback || '';
    })
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

/** Personalize a list of lines and drop any that end up empty. */
export function personalizeLines(lines: string[]): string[] {
  return lines.map(personalize).filter((line) => line.length > 0);
}

export interface TextSegment {
  text: string;
  emphasis: boolean;
}

/** Split `*emphasised*` spans out of a string so they can be styled. */
export function parseEmphasis(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /\*([^*]+)\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: text.slice(last, index), emphasis: false });
    segments.push({ text: match[1], emphasis: true });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), emphasis: false });
  return segments;
}

/** Plain text with emphasis markers removed (for aria-labels, titles, canvas). */
export function plainText(text: string): string {
  return personalize(text).replace(/\*/g, '');
}

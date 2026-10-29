import { parseEmphasis, personalize } from '../utils/personalize';

/** Renders configured copy with `*emphasis*` highlighted and name tokens filled in. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseEmphasis(personalize(text)).map((segment, i) =>
        segment.emphasis ? (
          <em key={i} className="accent">
            {segment.text}
          </em>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

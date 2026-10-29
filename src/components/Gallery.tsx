import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { valentineConfig } from '../config/valentine';
import { personalize } from '../utils/personalize';
import { Dialog } from './Dialog';
import { GalleryArt, type ArtName } from './GalleryArt';
import { RichText } from './RichText';
import './gallery.css';

type GalleryItem =
  | { kind: 'photo'; src: string; alt: string; caption?: string }
  | { kind: 'art'; art: ArtName; alt: string; caption: string };

const ART_ITEMS: GalleryItem[] = [
  { kind: 'art', art: 'mugs', alt: 'Illustration of two mugs with little hearts rising like steam', caption: 'Sweet moments' },
  { kind: 'art', art: 'moon', alt: 'Illustration of a winking crescent moon among stars', caption: 'Silly jokes' },
  { kind: 'art', art: 'gift', alt: 'Illustration of a gift box with a heart balloon floating out', caption: 'Unexpected surprises' },
  { kind: 'art', art: 'letter', alt: 'Illustration of a sealed love letter surrounded by petals', caption: 'Memories worth keeping' },
];

const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 60, scale: 0.96 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -60, scale: 0.96 }),
};

const assetUrl = (src: string) => (/^(https?:)?\/\//.test(src) || src.startsWith('data:') ? src : `${import.meta.env.BASE_URL}${src.replace(/^\.?\//, '')}`);

function Media({ item, onError }: { item: GalleryItem; onError: (src: string) => void }) {
  if (item.kind === 'art') return <GalleryArt name={item.art} />;
  return <img src={assetUrl(item.src)} alt={item.alt} loading="lazy" decoding="async" onError={() => onError(item.src)} />;
}

/**
 * "A Little Gallery of Us". Shows configured photos (broken ones are quietly
 * dropped) or, when there are none, a set of original illustrations.
 */
export function Gallery() {
  const { gallery } = valentineConfig;
  const [failed, setFailed] = useState<string[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  const photos: GalleryItem[] = gallery.images
    .filter((image) => image.src && !failed.includes(image.src))
    .map((image) => ({ kind: 'photo', ...image }));
  const showingPhotos = photos.length > 0;
  const items = showingPhotos ? photos : gallery.showIllustrationsWhenEmpty ? ART_ITEMS : [];

  if (items.length === 0) return null;

  const markFailed = (src: string) => setFailed((list) => (list.includes(src) ? list : [...list, src]));
  const current = index === null ? null : items[Math.min(index, items.length - 1)];

  const step = (dir: number) => {
    if (index === null) return;
    setDirection(dir);
    setIndex((index + dir + items.length) % items.length);
  };

  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') step(1);
    if (event.key === 'ArrowLeft') step(-1);
  };

  return (
    <section className="gallery" aria-labelledby="gallery-title">
      <motion.div
        className="gallery__intro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 id="gallery-title" className="gallery__title display">
          <RichText text={gallery.title} />
        </h2>
        <p className="gallery__subtitle">{personalize(showingPhotos ? gallery.subtitle : gallery.illustrationSubtitle)}</p>
      </motion.div>

      <ul className="gallery__grid">
        {items.map((item, i) => (
          <motion.li
            key={item.kind === 'photo' ? item.src : item.art}
            className="gallery__item"
            style={{ '--tilt': `${[-2.5, 1.8, -1.2, 2.4][i % 4]}deg` } as CSSProperties}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="gallery__card"
              onClick={() => {
                setDirection(1);
                setIndex(i);
              }}
              aria-label={`View larger: ${item.caption ?? item.alt}`}
            >
              <span className="gallery__frame">
                <Media item={item} onError={markFailed} />
              </span>
              {item.caption && <span className="gallery__caption">{personalize(item.caption)}</span>}
            </button>
          </motion.li>
        ))}
      </ul>

      <Dialog open={current !== null} onClose={() => setIndex(null)} labelledBy="lightbox-title" className="lightbox" onKeyDown={handleKeys}>
        <h3 id="lightbox-title" className="sr-only">
          Gallery viewer
        </h3>
        {current && index !== null && (
          <>
            <div className="lightbox__stage">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.figure
                  key={index}
                  className="lightbox__figure"
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="lightbox__media">
                    <Media item={current} onError={markFailed} />
                  </div>
                  <figcaption className="lightbox__caption">{personalize(current.caption ?? current.alt)}</figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
            {items.length > 1 && (
              <div className="lightbox__nav">
                <button type="button" className="lightbox__arrow" onClick={() => step(-1)} aria-label="Previous image">
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <span className="lightbox__count" aria-live="polite">
                  {index + 1} / {items.length}
                </span>
                <button type="button" className="lightbox__arrow" onClick={() => step(1)} aria-label="Next image">
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </Dialog>
    </section>
  );
}

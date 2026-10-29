import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EighthNotes, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';

/**
 * Sound is always off on arrival. A small prompt offers a soundtrack; the
 * toggle mutes instantly. Nothing plays until the visitor clicks.
 */
export function AudioToggle({ promptAllowed }: { promptAllowed: boolean }) {
  const sound = useSound();
  const [prompt, setPrompt] = useState(false);

  useEffect(() => {
    if (!sound.available || sound.preference === 'off') return;
    const show = window.setTimeout(() => setPrompt(true), 2800);
    const hide = window.setTimeout(() => setPrompt(false), 2800 + 16000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
    // Offered once per visit, on arrival — so the stored preference is read only at mount.
  }, [sound.available]);

  // The offer belongs to the calm opening; it never covers the question or the finale.
  useEffect(() => {
    if (!promptAllowed) setPrompt(false);
  }, [promptAllowed]);

  if (!sound.available) return null;

  return (
    <div className="audio-control">
      <motion.button
        type="button"
        className={`audio-toggle ${sound.enabled ? 'is-on' : ''}`}
        aria-label="Sound"
        aria-pressed={sound.enabled}
        title={sound.enabled ? 'Mute sound' : 'Turn sound on'}
        onClick={() => {
          setPrompt(false);
          sound.toggle();
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        {sound.enabled ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
        {sound.enabled && (
          <span className="audio-toggle__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {prompt && promptAllowed && !sound.enabled && (
          <motion.div
            className="audio-prompt"
            role="group"
            aria-label="Soundtrack"
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <p className="audio-prompt__text">
              <EighthNotes size={16} aria-hidden="true" />
              Add a little soundtrack? 🎵
            </p>
            <div className="audio-prompt__actions">
              <button
                type="button"
                className="audio-prompt__yes"
                onClick={() => {
                  setPrompt(false);
                  sound.enable();
                }}
              >
                Yes, please
              </button>
              <button
                type="button"
                className="audio-prompt__no"
                onClick={() => {
                  setPrompt(false);
                  sound.disable();
                }}
              >
                Not now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

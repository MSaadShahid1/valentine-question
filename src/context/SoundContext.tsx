import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AudioEngine, type SoundName } from '../audio/AudioEngine';

type SoundPreference = 'on' | 'off' | null;

interface SoundApi {
  available: boolean;
  enabled: boolean;
  /** Remembered answer to "Add a little soundtrack?" — only stored after the visitor chooses. */
  preference: SoundPreference;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  play: (name: SoundName) => void;
}

const STORAGE_KEY = 'valentine:sound';

const readPreference = (): SoundPreference => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'on' || value === 'off' ? value : null;
  } catch {
    return null;
  }
};

const writePreference = (value: 'on' | 'off') => {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage can be unavailable (private mode); the preference just won't persist.
  }
};

const SoundContext = createContext<SoundApi | null>(null);

export function SoundProvider({ available, children }: { available: boolean; children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [preference, setPreference] = useState<SoundPreference>(readPreference);

  const enable = useCallback(() => {
    if (!available) return;
    engineRef.current ??= new AudioEngine();
    setEnabled(true);
    setPreference('on');
    writePreference('on');
    void engineRef.current.enable().then((ok) => {
      if (ok) engineRef.current?.play('sparkle');
      else setEnabled(false);
    });
  }, [available]);

  const disable = useCallback(() => {
    engineRef.current?.disable();
    setEnabled(false);
    setPreference('off');
    writePreference('off');
  }, []);

  const play = useCallback((name: SoundName) => engineRef.current?.play(name), []);

  useEffect(() => () => engineRef.current?.dispose(), []);

  const api = useMemo<SoundApi>(
    () => ({
      available,
      enabled,
      preference,
      enable,
      disable,
      toggle: () => (enabled ? disable() : enable()),
      play,
    }),
    [available, enabled, preference, enable, disable, play],
  );

  return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const value = useContext(SoundContext);
  if (!value) throw new Error('useSound must be used inside <SoundProvider>');
  return value;
}

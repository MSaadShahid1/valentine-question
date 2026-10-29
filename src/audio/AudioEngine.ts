/**
 * Everything audible on the site is synthesized here with the Web Audio API —
 * no audio files, so there is nothing to license and nothing that can 404.
 * The context is only created after an explicit click on the sound control.
 */

export type SoundName = 'open' | 'sparkle' | 'pop' | 'chime' | 'confetti' | 'whoosh' | 'boop' | 'firework';

const MASTER_VOLUME = 0.7;
const MUSIC_VOLUME = 0.16;
const BPM = 76;

const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// An original eight-bar lullaby in F major: [midi note | null for rest, beats].
const MELODY: Array<[number | null, number]> = [
  [69, 1], [72, 1], [77, 1.5], [76, 0.5],
  [74, 1], [72, 1], [69, 2],
  [70, 1], [74, 1], [77, 1], [74, 1],
  [72, 1.5], [74, 0.5], [72, 1], [null, 1],
  [69, 1], [72, 1], [81, 1.5], [79, 0.5],
  [77, 1], [74, 1], [76, 1], [77, 1],
  [74, 1], [70, 1], [72, 1], [74, 1],
  [72, 2], [77, 2],
];

// One chord per bar (I – vi – IV – V, twice).
const CHORDS = [
  [53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55],
  [53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55],
];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private scheduler: number | null = null;
  private nextNoteTime = 0;
  private noteIndex = 0;
  private beatInLoop = 0;
  private enabled = false;

  get isEnabled() {
    return this.enabled;
  }

  /** Must be called from a user gesture (click / key press). */
  async enable() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.music = this.ctx.createGain();
      this.music.gain.value = MUSIC_VOLUME;
      this.music.connect(this.master);
      this.noise = this.createNoise();
    }
    this.enabled = true;
    await this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(0, now);
    this.master!.gain.linearRampToValueAtTime(MASTER_VOLUME, now + 0.4);
    this.startMusic();
    return true;
  }

  /** Silences immediately: gain to zero, scheduler stopped, context suspended. */
  disable() {
    this.enabled = false;
    this.stopMusic();
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(0, now);
      void this.ctx.suspend();
    }
  }

  dispose() {
    this.disable();
    void this.ctx?.close();
    this.ctx = null;
  }

  play(name: SoundName) {
    if (!this.enabled || !this.ctx || !this.master || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + 0.01;
    switch (name) {
      case 'sparkle':
        [0, 0.06, 0.12, 0.2, 0.27].forEach((offset, i) =>
          this.tone(midiToHz([88, 91, 93, 96, 100][i]), t + offset, 0.35, 0.05, 'sine'),
        );
        break;
      case 'pop':
        this.sweep(620, 190, t, 0.14, 0.18);
        this.tone(midiToHz(84), t + 0.03, 0.25, 0.04, 'triangle');
        break;
      case 'boop':
        this.sweep(320, 760, t, 0.16, 0.12);
        break;
      case 'chime':
        [84, 88, 91, 96].forEach((note, i) => this.tone(midiToHz(note), t + i * 0.07, 1.5, 0.07, 'sine'));
        break;
      case 'whoosh':
        this.noiseSweep(t, 0.6, 400, 2400, 0.12);
        break;
      case 'open':
        this.noiseSweep(t, 0.45, 900, 3600, 0.16);
        [79, 84, 88].forEach((note, i) => this.tone(midiToHz(note), t + 0.25 + i * 0.09, 1.1, 0.06, 'sine'));
        break;
      case 'firework':
        this.noiseSweep(t, 0.7, 160, 60, 0.32, 'lowpass');
        for (let i = 0; i < 6; i += 1) this.noiseSweep(t + 0.12 + Math.random() * 0.5, 0.05, 5000, 7000, 0.05);
        break;
      case 'confetti':
        this.noiseSweep(t, 0.35, 2500, 6000, 0.14);
        for (let i = 0; i < 7; i += 1) this.sweep(500 + Math.random() * 500, 160, t + 0.05 + i * 0.05, 0.1, 0.08);
        [77, 81, 84, 89, 93].forEach((note, i) => this.tone(midiToHz(note), t + 0.2 + i * 0.08, 1.6, 0.06, 'sine'));
        break;
    }
  }

  private createNoise() {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /** A soft bell/music-box voice: fundamental + gentle overtone, exponential decay. */
  private tone(freq: number, start: number, duration: number, volume: number, type: OscillatorType, out?: AudioNode) {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    gain.connect(out ?? this.master!);

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + duration + 0.05);

    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.value = freq * 3;
    overtoneGain.gain.value = 0.18;
    overtone.connect(overtoneGain).connect(gain);
    overtone.start(start);
    overtone.stop(start + duration * 0.5);
  }

  private sweep(from: number, to: number, start: number, duration: number, volume: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(this.master!);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private noiseSweep(start: number, duration: number, from: number, to: number, volume: number, type: BiquadFilterType = 'bandpass') {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(from, start);
    filter.frequency.exponentialRampToValueAtTime(to, start + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(this.master!);
    source.start(start);
    source.stop(start + duration + 0.05);
  }

  private pad(notes: number[], start: number, duration: number) {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.05, start + 0.8);
    gain.gain.linearRampToValueAtTime(0.0001, start + duration + 0.6);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(gain).connect(this.music!);
    for (const note of notes) {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = midiToHz(note);
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(start);
        osc.stop(start + duration + 0.7);
      }
    }
  }

  private startMusic() {
    if (this.scheduler !== null || !this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.15;
    this.noteIndex = 0;
    this.beatInLoop = 0;
    const beat = 60 / BPM;
    // Look-ahead scheduler: queue notes slightly ahead of time for glitch-free playback.
    this.scheduler = window.setInterval(() => {
      if (!this.ctx) return;
      while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
        if (this.beatInLoop % 4 === 0) {
          const chord = CHORDS[Math.floor(this.beatInLoop / 4) % CHORDS.length];
          this.pad(chord, this.nextNoteTime, beat * 4);
        }
        const [note, beats] = MELODY[this.noteIndex];
        if (note !== null) this.tone(midiToHz(note), this.nextNoteTime, beat * Math.max(beats, 1) * 1.6, 0.11, 'sine', this.music!);
        this.nextNoteTime += beats * beat;
        this.beatInLoop = (this.beatInLoop + beats) % 32;
        this.noteIndex = (this.noteIndex + 1) % MELODY.length;
      }
    }, 50);
  }

  private stopMusic() {
    if (this.scheduler !== null) window.clearInterval(this.scheduler);
    this.scheduler = null;
  }
}

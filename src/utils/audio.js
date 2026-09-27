// Web Audio API synthesizer for native tactile feedback without external audio files
class SoundManager {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.hapticEnabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  // Soft tactile tap (tab change, button press)
  playTap() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }

    this.vibrate(15);
  }

  // Golden chime (reward, copy, success)
  playSuccess() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Golden chord)
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        const startTime = this.ctx.currentTime + idx * 0.06;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {}

    this.vibrate([20, 40, 30]);
  }

  // Epic Towny Portal / Connect sound: Warm sub-bass punch + triumphant golden arpeggio + crystal shimmer
  playLaunch() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;

      // Master warmth filter (soft low-pass to eliminate any harsh high frequency clicks)
      const masterFilter = this.ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(3400, now);
      masterFilter.Q.setValueAtTime(1.2, now);
      masterFilter.connect(this.ctx.destination);

      // 1. Deep Sub-Bass Impact (tactile portal surge)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.32);

      subGain.gain.setValueAtTime(0.24, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      subOsc.connect(subGain);
      subGain.connect(masterFilter);
      subOsc.start(now);
      subOsc.stop(now + 0.36);

      // 2. Triumphant Golden Arpeggio (D-major fantasy chord: D4, A4, D5, F#5, A5, D6)
      const chordNotes = [
        { freq: 293.66, delay: 0.00, dur: 0.35, vol: 0.14 }, // D4
        { freq: 440.00, delay: 0.05, dur: 0.40, vol: 0.16 }, // A4
        { freq: 587.33, delay: 0.10, dur: 0.45, vol: 0.18 }, // D5
        { freq: 739.99, delay: 0.15, dur: 0.50, vol: 0.20 }, // F#5
        { freq: 880.00, delay: 0.20, dur: 0.55, vol: 0.20 }, // A5
        { freq: 1174.66, delay: 0.26, dur: 0.70, vol: 0.22 }, // D6 (Crystalline pinnacle)
      ];

      chordNotes.forEach(({ freq, delay, dur, vol }) => {
        const noteStart = now + delay;
        const noteEnd = noteStart + dur;

        // Warm harmonic body (triangle)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Gentle sparkle / chorus layer (sine with micro-detune)
        const sparkle = this.ctx.createOscillator();
        const sparkleGain = this.ctx.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(freq * 1.003, noteStart);

        // Smooth non-clicking attack and exponential release
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(vol, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        sparkleGain.gain.setValueAtTime(0.001, noteStart);
        sparkleGain.gain.linearRampToValueAtTime(vol * 0.35, noteStart + 0.02);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        osc.connect(gain);
        gain.connect(masterFilter);

        sparkle.connect(sparkleGain);
        sparkleGain.connect(masterFilter);

        osc.start(noteStart);
        osc.stop(noteEnd);
        sparkle.start(noteStart);
        sparkle.stop(noteEnd);
      });
    } catch {}

    this.vibrate([25, 35, 70]);
  }

  vibrate(pattern) {
    if (this.hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }
}

export const sound = new SoundManager();

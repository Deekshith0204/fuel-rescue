/**
 * Audio Service for FuelRescue
 * Generates synthesized emergency sirens and alert chimes using the HTML5 Web Audio API.
 * Requires zero external audio files and works in all modern browsers.
 */

class AudioService {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Plays a distinct dual-tone emergency roadside dispatch alert (ambulance/responder style)
   */
  playEmergencySiren() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, now);

      // Alternating 2-tone siren (780Hz -> 960Hz -> 780Hz)
      osc.frequency.setValueAtTime(780, now);
      osc.frequency.setValueAtTime(960, now + 0.25);
      osc.frequency.setValueAtTime(780, now + 0.5);
      osc.frequency.setValueAtTime(960, now + 0.75);
      osc.frequency.setValueAtTime(780, now + 1.0);
      osc.frequency.setValueAtTime(960, now + 1.25);
      osc.frequency.setValueAtTime(780, now + 1.5);

      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.0);
    } catch (e) {
      console.warn("Audio siren playback failed or blocked by browser gesture policy:", e);
    }
  }

  /**
   * Plays a crisp high-pitched dispatch ping
   */
  playDispatchPing() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  /**
   * Plays success chime for payment or OTP verified
   */
  playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.18, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.3);
      });
    } catch (e) {}
  }
}

export const audioService = new AudioService();

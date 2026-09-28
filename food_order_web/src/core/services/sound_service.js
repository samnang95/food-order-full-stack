import { LocalDB } from '../db';

const SOUND_ENABLED_KEY = 'bitecraft_sound_enabled';

class SoundService {
  constructor() {
    this._ctx = null;
    this.enabled = LocalDB.getBool(SOUND_ENABLED_KEY, true);
  }

  isSoundEnabled() {
    return this.enabled;
  }

  setSoundEnabled(enabled) {
    this.enabled = Boolean(enabled);
    LocalDB.setBool(SOUND_ENABLED_KEY, this.enabled);
  }

  _getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this._ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this._ctx = new AudioCtx();
      }
    }
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  }

  /**
   * Harmonious success chime (E5 -> G#5 -> B5 arpeggio)
   */
  playSuccess() {
    if (!this.enabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (e) {
      console.debug('[SoundService] playSuccess error:', e);
    }
  }

  /**
   * Gentle pop chime for quick actions (e.g. add to cart)
   */
  playPop() {
    if (!this.enabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      console.debug('[SoundService] playPop error:', e);
    }
  }

  /**
   * Status change bell (Order on the way / Driver arrived)
   */
  playBell() {
    if (!this.enabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 783.99]; // C5, G5

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.65);
      });
    } catch (e) {
      console.debug('[SoundService] playBell error:', e);
    }
  }
}

export const soundService = new SoundService();

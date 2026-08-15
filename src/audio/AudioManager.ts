/**
 * Lightweight Web Audio synthesizer — original retro blips, no copyrighted samples.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private ensure(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private beep(
    freq: number,
    duration: number,
    type: OscillatorType = "square",
    gain = 0.08,
  ): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  button(): void {
    this.beep(440, 0.05, "square", 0.05);
  }

  start(): void {
    this.beep(330, 0.08);
    setTimeout(() => this.beep(440, 0.08), 90);
    setTimeout(() => this.beep(550, 0.1), 180);
  }

  catch(): void {
    this.beep(660, 0.07, "square", 0.07);
    setTimeout(() => this.beep(880, 0.09, "square", 0.06), 60);
  }

  miss(): void {
    this.beep(180, 0.15, "sawtooth", 0.07);
    setTimeout(() => this.beep(120, 0.2, "sawtooth", 0.06), 100);
  }

  gameOver(): void {
    this.beep(300, 0.12);
    setTimeout(() => this.beep(220, 0.14), 130);
    setTimeout(() => this.beep(150, 0.28, "triangle", 0.08), 280);
  }

  highScore(): void {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.12, "square", 0.06), i * 100);
    });
  }
}

export const audioManager = new AudioManager();

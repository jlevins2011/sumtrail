/** Monotonic active time: introductions and breaks never affect learning reports. */
export class PracticeClock {
  private accumulated = 0;
  private activeSince: number | null = null;
  constructor(private now: () => number = () => performance.now(), initialElapsed = 0) { this.accumulated = initialElapsed; }
  resume() { if (this.activeSince === null) this.activeSince = this.now(); }
  pause() { this.accumulated = this.elapsed(); this.activeSince = null; }
  elapsed() { return this.accumulated + (this.activeSince === null ? 0 : this.now() - this.activeSince); }
}

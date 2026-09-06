import { describe, it, expect } from 'vitest';
import { PracticeClock } from './practiceClock';
describe('practice time', () => {
  it('excludes the introduction and multiple breaks without resetting an answer timer', () => {
    let now = 0;
    const clock = new PracticeClock(() => now);
    now = 60000;
    expect(clock.elapsed()).toBe(0);
    clock.resume(); now += 1200;
    const askedAt = clock.elapsed();
    now += 800; clock.pause(); now += 300000;
    expect(clock.elapsed() - askedAt).toBe(800);
    clock.resume(); now += 900; clock.pause(); now += 40000;
    expect(clock.elapsed() - askedAt).toBe(1700);
    expect(clock.elapsed()).toBe(2900);
  });
  it('treats repeated pause/resume events as idempotent', () => {
    let now = 0;
    const clock = new PracticeClock(() => now);
    clock.resume(); now = 500; clock.resume(); now = 1000;
    clock.pause(); now = 5000; clock.pause();
    expect(clock.elapsed()).toBe(1000);
  });
});

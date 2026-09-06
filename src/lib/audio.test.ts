import { afterEach,expect,it,vi } from 'vitest';
import { setAudioEnabled,sounds } from './audio';
afterEach(()=>{setAudioEnabled(true);vi.useRealTimers();});
it('cancels queued melody notes when muted',()=>{
  vi.useFakeTimers();
  setAudioEnabled(true);sounds.star();
  expect(vi.getTimerCount()).toBe(2);
  setAudioEnabled(false);
  expect(vi.getTimerCount()).toBe(0);
  sounds.star();expect(vi.getTimerCount()).toBe(0);
});

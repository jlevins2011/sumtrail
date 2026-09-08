import type { Lesson } from '../types';
/** A visual thinking allowance, never a deadline; chosen for gameplay, not a CCSS time standard. */
export function thinkingWindowMs(lesson:Lesson):number {
  const camp:Record<string,number>={'ember-grove':12000,'pine-bridge':18000,'multiplying-meadow':24000,'division-hollow':30000,'night-sum':36000};
  let ms=camp[lesson.worldId]??12000;
  if((lesson.bank.mulFactors??[]).some(n=>n>10)) ms=Math.max(ms,30000);
  if((lesson.bank.divDivisors??[]).some(n=>n>10)) ms=Math.max(ms,36000);
  return ms;
}

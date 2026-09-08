import { expect,it } from 'vitest';
import { LESSONS } from '../data/curriculum';
import { buildRound,isCorePractice } from './facts';
import { thinkingWindowMs } from './pacing';
import { evaluateRound } from './engine';
import { START_LEVELS,startLevelFor } from './startLevel';
it('preserves stored placements while honestly labeling division and review',()=>{
 expect(startLevelFor('4').campId).toBe('division-hollow');
 expect(startLevelFor('4').label).toContain('Grade 3');
 expect(startLevelFor('5+').label).toContain('review');
 expect(START_LEVELS.some(l=>/Grade [45]/.test(l.label))).toBe(false);
});
it('limits identity facts throughout normal trails, retaining the dedicated zero/one lesson',()=>{
 for(const lesson of LESSONS) for(let i=0;i<30;i++){
  const r=buildRound(lesson.bank,lesson.questionCount);
  expect(r).toHaveLength(lesson.questionCount);
  if(lesson.id==='meadow-zero-one'){expect(r.every(f=>!isCorePractice(f))).toBe(true);continue;}
  expect(isCorePractice(r[0])).toBe(true);
  expect(r.filter(f=>!isCorePractice(f)).length).toBeLessThanOrEqual(Math.floor(lesson.questionCount/8));
 }
});
it('gives later and extension facts more thinking time without a timeout failure',()=>{
 const lessons=['ember-meet','pine-add','meadow-easy','hollow-easy','summit-warm'].map(id=>LESSONS.find(l=>l.id===id)!);
 expect(lessons.map(thinkingWindowMs)).toEqual([12000,18000,24000,30000,36000]);
 for(const l of lessons) expect(evaluateRound(l,l.questionCount,0,Array(l.questionCount).fill(120000)).passed).toBe(true);
 const early=lessons[0],later=lessons[4];
 expect(evaluateRound(later,later.questionCount,0,[20000]).smoothness).toBeGreaterThan(evaluateRound(early,early.questionCount,0,[20000]).smoothness);
});

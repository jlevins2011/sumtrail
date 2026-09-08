import { expect,it } from 'vitest';
import { LESSONS,lessonsInWorld,WORLDS } from '../data/curriculum';
import { candidatesFor } from './facts';
import { openingRound } from './openingRound';
it('gives the first six lanterns real addition practice without zero padding or reversed repeats',()=>{
 const l=LESSONS[0];
 for(let seed=1;seed<=50;seed++){
  let n=seed;const rand=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
  const round=openingRound(l.bank,l.questionCount,rand);
  expect(round).toHaveLength(6);
  expect(round.every(f=>f.a>0&&f.b>0&&f.answer<=5)).toBe(true);
  expect(new Set(round.map(f=>[f.a,f.b].sort().join('-'))).size).toBe(6);
 }
});
it('keeps each grade entry inside its original bank and question count',()=>{
 for(const w of WORLDS){
  const l=lessonsInWorld(w.id)[0],ids=new Set(candidatesFor(l.bank).map(f=>f.id));
  const round=openingRound(l.bank,l.questionCount);
  expect(round).toHaveLength(l.questionCount);
  expect(round.every(f=>ids.has(f.id)&&f.a>0&&f.b>0)).toBe(true);
 }
});
it('preserves dedicated zero/one banks when a child chooses one',()=>{
 const l=LESSONS.find(l=>l.id==='meadow-zero-one')!;
 expect(openingRound(l.bank,l.questionCount)).toHaveLength(l.questionCount);
});

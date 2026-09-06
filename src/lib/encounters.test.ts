import { expect,it } from 'vitest';
import { candidatesFor,makeFact } from './facts';
import { LESSONS } from '../data/curriculum';
import { modelGroups,modelValue,stepsFor } from './encounters';
it('models every curriculum fact with the correct total and equal division shares',()=>{
  const seen=new Set<string>();
  for(const lesson of LESSONS) for(const f of candidatesFor(lesson.bank)) {
    if(seen.has(f.id))continue;seen.add(f.id);
    expect(modelValue(f,stepsFor(f))).toBe(f.answer);
    expect(modelValue(f,stepsFor(f)+100)).toBe(f.answer);
    for(let step=0;step<=stepsFor(f);step++) {
      const groups=modelGroups(f,step);
      expect(groups.every(n=>Number.isInteger(n)&&n>=0)).toBe(true);
      if(f.op==='div') {expect(new Set(groups).size).toBe(1);expect(groups.reduce((a,b)=>a+b,0)).toBe(step*f.b);}
      if(f.op==='mul') expect(groups.reduce((a,b)=>a+b,0)).toBe(step*f.b);
    }
  }
  expect(seen.size).toBeGreaterThan(500);
});
it('handles zero groups, empty groups and zero shared berries',()=>{
  expect(modelGroups(makeFact('mul',0,7),0)).toEqual([]);
  expect(modelValue(makeFact('mul',7,0),7)).toBe(0);
  expect(modelGroups(makeFact('div',0,3),0)).toEqual([0,0,0]);
});

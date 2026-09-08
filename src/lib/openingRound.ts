import type { FactBank, Fact } from '../types';
import { buildRound, candidatesFor, shuffle, isCorePractice } from './facts';
/** Only a fresh explorer's first round. Keep the existing bank and question count. */
export function openingRound(bank:FactBank,count:number,rand:()=>number=Math.random):Fact[] {
  const useful=candidatesFor(bank).filter(isCorePractice);
  const seen=new Set<string>();
  const varied=shuffle(useful,rand).filter(f=>{
    const key=f.op==='add'||f.op==='mul'?`${f.op}-${Math.min(f.a,f.b)}-${Math.max(f.a,f.b)}`:f.id;
    if(seen.has(key))return false;seen.add(key);return true;
  });
  // Dedicated zero/one lessons remain intact if chosen for the first session.
  if(!varied.length)return buildRound(bank,count,rand);
  const round=varied.slice(0,count);
  const remaining=shuffle(useful.filter(f=>!round.some(r=>r.id===f.id)),rand);
  while(round.length<count) round.push(remaining.shift() ?? varied[round.length%varied.length]);
  return round;
}

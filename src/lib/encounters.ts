import type { Fact, Operation } from '../types';
export const ENCOUNTERS: Record<Operation, {title:string; action:string; instruction:(f:Fact)=>string}> = {
  add: {title:'Stone garden',action:'Bring one stone',instruction:f=>`Start with ${f.a} stones. Bring ${f.b} more to the garden.`},
  sub: {title:'River delivery',action:'Send one stone',instruction:f=>`Start with ${f.a} stones. Send ${f.b} downstream. How many stay?`},
  mul: {title:'Clover nursery',action:'Plant one row',instruction:f=>`Plant ${f.a} rows, with ${f.b} clovers in every row.`},
  div: {title:'Woodland picnic',action:'Share with every basket',instruction:f=>`Share ${f.a} berries equally among ${f.b} baskets. Give each basket one berry at a time.`},
};
export function stepsFor(f:Fact) { return f.op === 'mul' ? (f.b===0?0:f.a) : f.op === 'div' ? f.answer : f.b; }
export function modelValue(f:Fact, steps:number) {
  const n=Math.max(0,Math.min(stepsFor(f),Math.floor(steps)));
  return f.op==='add'?f.a+n:f.op==='sub'?f.a-n:f.op==='mul'?n*f.b:n;
}
export function modelGroups(f:Fact, steps:number): number[] {
  const n=Math.max(0,Math.min(stepsFor(f),Math.floor(steps)));
  if(f.op==='mul') return Array.from({length:f.a},(_,i)=>i<n?f.b:0);
  if(f.op==='div') return Array(f.b).fill(n);
  return [modelValue(f,n)];
}
export function example(op:Operation): Fact {
  const [a,b]=op==='add'?[4,3]:op==='sub'?[8,3]:op==='mul'?[3,4]:[12,3];
  const answer=op==='add'?a+b:op==='sub'?a-b:op==='mul'?a*b:a/b;
  const symbol={add:'+',sub:'−',mul:'×',div:'÷'}[op];
  return {id:`${op}-${a}-${b}`,a,b,op,answer,prompt:`${a} ${symbol} ${b}`,tip:op==='div'?`${a} berries shared among ${b} baskets gives ${answer} in each.`:`${a} ${symbol} ${b} = ${answer}.`};
}

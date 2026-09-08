import { useState } from 'react';
import { getLesson, getWorld, lessonsInWorld } from '../data/curriculum';
import { buildRound } from '../lib/facts';
import { example } from '../lib/encounters';
import { recommendedLessonId } from '../lib/stats';
import { isDemoMode } from '../lib/demo';
import { useActiveChild, useStore } from '../store/StoreContext';
import type { Operation } from '../types';
import { PracticeEncounter } from './MathEncounter';
export function Workshop({worldId}: {worldId:string}) {
  const {dispatch}=useStore();
  const child=useActiveChild();
  const next=child?getLesson(recommendedLessonId(child,isDemoMode())):undefined;
  const lessons=lessonsInWorld(worldId);
  const operations=[...new Set(lessons.flatMap(l=>l.bank.operations))];
  const [op,setOp]=useState<Operation>(operations[0]??'add');
  const [fact,setFact]=useState(()=>example(op));
  const [round,setRound]=useState(0);
  function choose(next:Operation) {setOp(next);setFact(example(next));setRound(n=>n+1);}
  return <div className="screen workshop">
    <button className="text-back" onClick={()=>dispatch({type:'go',view:{name:'map'}})}>← Camps</button>
    <p className="eyebrow">{getWorld(worldId)?.name} · FIELD WORKSHOP</p><h1>Math you can move.</h1>
    <p className="lede">Try an idea with your hands. There is no timer or score here. When you are ready, take a trail to show what you know.</p>
    {next&&<button className="btn model-reset workshop-return" onClick={()=>dispatch({type:'go',view:{name:'lesson',lessonId:next.id}})}>Ready for a trail: {next.title}</button>}
    <div className="workshop-tabs" aria-label="Choose an operation">{operations.map(o=><button key={o} className={`chip ${o===op?'on':''}`} aria-pressed={o===op} onClick={()=>choose(o)}>{{add:'Add stones',sub:'Send stones',mul:'Plant rows',div:'Share berries'}[o]}</button>)}</div>
    <PracticeEncounter key={round} fact={fact}/>
    <button className="btn primary" onClick={()=>{const lesson=[...lessons].reverse().find(l=>l.bank.operations.includes(op))!;setFact(buildRound({...lesson.bank,operations:[op]},1)[0]);setRound(n=>n+1);}}>Try another example</button>
  </div>;
}

import { useState } from 'react';
import type { Fact } from '../types';
import { ENCOUNTERS, modelGroups, modelValue, stepsFor } from '../lib/encounters';
export function MathEncounter({fact, steps, onStep}: {fact:Fact;steps:number;onStep:(steps:number)=>void}) {
  const activity=ENCOUNTERS[fact.op];
  const done=steps>=stepsFor(fact);
  const groups=modelGroups(fact,steps);
  return <section className={`encounter encounter-${fact.op}`} aria-label={activity.title}>
    <p className="eyebrow">BUILD IT · SEE IT · UNDERSTAND IT</p>
    <h2>{activity.title}</h2><p>{activity.instruction(fact)}</p>
    <div className="model-groups" aria-label={fact.op==='div'?`${steps * fact.b} of ${fact.a} berries shared`:`${modelValue(fact,steps)} items placed`}>
      {groups.map((count,i)=><div className="model-group" key={i}>
        {(fact.op==='mul'||fact.op==='div')&&<small>{fact.op==='mul'?'Row':'Basket'} {i+1}</small>}
        <div className="model-tokens" style={fact.op==='mul'?{gridTemplateColumns:`repeat(${Math.max(1,fact.b)}, 14px)`}:undefined} aria-hidden="true">{Array.from({length:count},(_,n)=><i key={n}/>)}</div>
        <b>{count}{fact.op==='div'?' each':''}</b>
      </div>)}
    </div>
    {fact.op==='div'&&<p className="model-remaining">{Math.max(0,fact.a-steps*fact.b)} berries still in the pouch</p>}
    {fact.op==='sub'&&<p className="model-remaining">{steps} sent downstream · {fact.b-steps} still to send</p>}
    <div className="row-actions">
      <button className="btn primary" disabled={done} onClick={()=>onStep(steps+1)}>{done?'Built!':activity.action}</button>
      <button className="btn model-reset" disabled={steps===0} onClick={()=>onStep(0)}>Reset model</button>
    </div>
    <p className="model-explanation" role="status">{done?`${fact.prompt} = ${fact.answer}. ${fact.tip}`:`${steps} of ${stepsFor(fact)} steps. Keep building.`}</p>
  </section>;
}
export function PracticeEncounter({fact}: {fact:Fact}) {
  const [steps,setSteps]=useState(0);
  return <MathEncounter fact={fact} steps={steps} onStep={setSteps}/>;
}

import { useState } from 'react';
import { useActiveChild, useStore } from '../store/StoreContext';
import type { Fact, Operation } from '../types';
import { makeFact } from '../lib/facts';
import { weakFacts } from '../lib/stats';
import { PracticeEncounter } from './MathEncounter';
import { Pip } from './Pip';
const OP_LABEL: Record<Operation,string> = {add:'Add',sub:'Subtract',mul:'Multiply',div:'Divide'};
export function Journal() {
  const {dispatch}=useStore();
  const child=useActiveChild();
  const [filter,setFilter]=useState('all');
  const [query,setQuery]=useState('');
  const [reviewOnly,setReviewOnly]=useState(false);
  const [practice,setPractice]=useState<Fact|null>(null);
  if(!child) return null;
  const weak=weakFacts(child,500);
  const missed=new Set(weak.map(w=>w.key));
  const ids=[...new Set([...child.journal.map(e=>e.id),...missed])];
  const facts=ids.flatMap(id=>{
    const [op,a,b]=id.split('-');
    if(!['add','sub','mul','div'].includes(op)||![a,b].every(n=>/^\d+$/.test(n))||+a>144||+b>144||op==='div'&&+b===0) return [];
    return [makeFact(op as Operation,+a,+b)];
  }).filter(f=>(filter==='all'||filter===f.op)&&(!reviewOnly||missed.has(f.id))&&(`${f.prompt} ${f.tip}`.toLowerCase().includes(query.toLowerCase())));
  return <div className="screen journal">
    <button className="text-back" onClick={()=>dispatch({type:'go',view:{name:'map'}})}>← Camps</button>
    <div className="map-who"><Pip coat={child.coat} pose="sit" size={72}/><div><h1>Field notes</h1><p className="lede">Discover a pattern. Rebuild a tricky fact. Make it yours.</p></div></div>
    <div className="journal-tools"><label>Find a fact<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try 8 or doubles"/></label><label>Operation<select aria-label="Operation" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All operations</option>{Object.entries(OP_LABEL).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label className="toggle"><input type="checkbox" checked={reviewOnly} onChange={e=>setReviewOnly(e.target.checked)}/>Facts to revisit</label></div>
    {practice&&<div className="journal-practice"><button className="btn ghost" onClick={()=>setPractice(null)}>Close practice</button><PracticeEncounter key={practice.id} fact={practice}/><p className="fine">Journal practice does not change your trail scores.</p></div>}
    {facts.length===0?<p className="lede">{ids.length?'No facts match these filters.':'Your first trail will start these notes. Workshops are ready at camp whenever you want to explore.'}</p>:<div className="journal-grid">{facts.map(f=><article key={f.id} className="journal-card panel"><p className="eyebrow">{OP_LABEL[f.op]}{missed.has(f.id)?' · Revisit':''}</p><h3>{f.prompt} = {f.answer}</h3><p className="tip">{f.tip}</p><button className="btn model-reset" onClick={()=>setPractice(f)}>Build this fact</button></article>)}</div>}
  </div>;
}

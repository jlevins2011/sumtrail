let ctx: AudioContext | null = null;
let enabled = true;
const active = new Set<OscillatorNode>();
const timers = new Set<ReturnType<typeof setTimeout>>();
function context(): AudioContext | null {
  if(typeof window==='undefined') return null;
  if(!ctx) {
    const Ctor=window.AudioContext || (window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
    if(!Ctor) return null;
    try {ctx=new Ctor();} catch {return null;}
  }
  return ctx;
}
export function setAudioEnabled(next:boolean) {
  enabled=next;
  if(!next) {
    for(const timer of timers) clearTimeout(timer);
    timers.clear();
    for(const osc of active) {try{osc.stop();}catch{/* already ended */}}
    active.clear();
  }
}
export function unlockAudio() {
  if(!enabled) return;
  const c=context();
  if(c?.state==='suspended') void c.resume().catch(()=>{});
}
function beep(freq:number,duration:number,type:OscillatorType,gain=.04) {
  if(!enabled) return;
  const c=context(); if(!c) return;
  const osc=c.createOscillator(),g=c.createGain();
  osc.type=type;osc.frequency.value=freq;
  g.gain.setValueAtTime(gain,c.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);
  osc.connect(g);g.connect(c.destination);
  active.add(osc);osc.onended=()=>{active.delete(osc);osc.disconnect();g.disconnect();};
  osc.start();osc.stop(c.currentTime+duration);
}
function later(fn:()=>void,ms:number) {if(!enabled)return;const timer=setTimeout(()=>{timers.delete(timer);if(enabled)fn();},ms);timers.add(timer);}
export const sounds={
  correct(){beep(660,.06,'sine',.03);},combo(){beep(880,.08,'triangle',.035);},miss(){beep(180,.12,'sine',.03);},
  star(){beep(523,.12,'triangle');later(()=>beep(659,.12,'triangle'),90);later(()=>beep(784,.18,'triangle'),180);},
  start(){beep(392,.1,'sine');later(()=>beep(523,.14,'sine'),100);},
};

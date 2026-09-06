import { lanternColor } from "../lib/keepsakes";
import type { CSSProperties } from "react";
import type { Coat, Mood } from "../types";
import { Pip } from "./Pip";

export function BridgeJourney({ coat, mood, total, outcomes, lanternStyle }: { lanternStyle?: string; coat: Coat; mood: Mood; total: number; outcomes: boolean[] }) {
  const progress = outcomes.length / total;
  return <section style={{"--lantern-color":lanternColor(lanternStyle)} as CSSProperties} className={`bridge-journey bridge-${mood}`} aria-label={`River crossing: ${outcomes.length} of ${total} lanterns explored, ${outcomes.filter(Boolean).length} lit`}>
    <div className="bridge-art" aria-hidden="true">
      <div className="bridge-moon" />
      <div className="bridge-hills far" /><div className="bridge-hills near" />
      <div className="bridge-trees">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${i * 9 - 3}%`, height: `${65 + i % 3 * 22}px` }} />)}</div>
      <div className="bridge-river" />
      <div className="bridge-deck" />
      <div className="bridge-lights">{Array.from({ length: total }, (_, i) => <i key={i} data-outcome={outcomes[i] === true ? "lit" : outcomes[i] === false ? "review" : "waiting"} />)}</div>
      <div className="bridge-tent" />
      <div className="bridge-fox" style={{ left: `${5 + progress * 78}%` }}><Pip coat={coat} pose={outcomes.at(-1) === true ? "celebrate" : "sit"} size={84} /></div>
    </div>
    <div className="bridge-caption"><span>THE LANTERN CROSSING</span><strong>{outcomes.length === total ? "Camp is just ahead" : outcomes.at(-1) === true ? "A little brighter. A little closer." : "Light the way to camp"}</strong></div>
  </section>;
}

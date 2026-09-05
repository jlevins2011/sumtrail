import { useActiveChild, useStore } from "../store/StoreContext";
import type { Operation } from "../types";
import { Pip } from "./Pip";

const OP_LABEL: Record<Operation, string> = {
  add: "Add",
  sub: "Subtract",
  mul: "Multiply",
  div: "Divide",
};

export function Journal() {
  const { dispatch } = useStore();
  const child = useActiveChild();
  if (!child) return null;

  return (
    <div className="screen journal">
      <button className="text-back" onClick={() => dispatch({ type: "go", view: { name: "map" } })}>
        ← Camps
      </button>
      <div className="map-who">
        <Pip coat={child.coat} pose="sit" size={72} />
        <div>
          <h1>Fact journal</h1>
          <p className="lede">
            {child.journal.length} number-sense tips in {child.name}’s pouch. Light a lantern to keep the line.
          </p>
        </div>
      </div>
      {child.journal.length === 0 ? (
        <p className="muted">Still dark. Play Ember Grove and Pip will jot the first tips here.</p>
      ) : (
        <div className="journal-grid">
          {child.journal.map((entry) => (
            <article key={entry.id} className="journal-card panel is-known">
              <p className="eyebrow">{OP_LABEL[entry.op]}</p>
              <h3>{entry.prompt}</h3>
              <p className="tip">{entry.tip}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

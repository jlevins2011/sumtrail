import { useState } from "react";
import { DEFAULT_GRADE_BAND } from "../lib/startLevel";
import { useActiveChild, useStore } from "../store/StoreContext";
import { Pip } from "./Pip";
import { StartLevelPicker } from "./StartLevelPicker";

export function StartLevelScreen() {
  const { dispatch } = useStore();
  const child = useActiveChild();
  const [gradeBand, setGradeBand] = useState(DEFAULT_GRADE_BAND);

  if (!child) return null;

  return (
    <div className="screen start-level">
      <Pip coat={child.coat} pose="sit" size={96} />
      <h1>Where should we start?</h1>
      <p className="lede">
        Pick the grade that fits {child.name}. Pip opens that camp and every trail before it, so they can still drop
        back for review.
      </p>
      <div className="panel form start-level-panel">
        <StartLevelPicker value={gradeBand} onChange={setGradeBand} />
        <div className="row-actions">
          <button
            className="btn primary"
            type="button"
            onClick={() => dispatch({ type: "set-start-level", id: child.id, gradeBand })}
          >
            This is our camp
          </button>
        </div>
      </div>
    </div>
  );
}

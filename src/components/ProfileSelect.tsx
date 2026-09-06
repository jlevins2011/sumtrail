import { useState } from "react";
import { DEFAULT_GRADE_BAND, resolveStartLevel } from "../lib/startLevel";
import { useStore } from "../store/StoreContext";
import { MAX_PROFILES, type Coat, type GradeBand } from "../types";
import { COAT_OPTIONS, Pip } from "./Pip";
import { StartLevelPicker } from "./StartLevelPicker";

export function ProfileSelect() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState("");
  const [coat, setCoat] = useState<Coat>("ember");
  const [gradeBand, setGradeBand] = useState<GradeBand>(DEFAULT_GRADE_BAND);
  const [adding, setAdding] = useState(state.children.length === 0);
  const atCap = state.children.length >= MAX_PROFILES;

  return (
    <div className="screen profiles">
      <button className="text-back" onClick={() => dispatch({ type: "go", view: { name: "title" } })}>
        ← Back
      </button>
      <h1>Who is exploring?</h1>
      <p className="lede">Up to {MAX_PROFILES} kids get a fox coat, a trail map, and their own fact journal.</p>

      {state.children.length > 0 && !adding && (
        <div className="profile-grid">
          {state.children.map((child) => (
            <button
              key={child.id}
              className="profile-card"
              onClick={() => dispatch({ type: "select-child", id: child.id })}
            >
              <Pip coat={child.coat} pose="idle" size={88} />
              <strong>{child.name}</strong>
              <span className="profile-start">{resolveStartLevel(child).campName}</span>
            </button>
          ))}
          {!atCap && (
            <button className="profile-card add" onClick={() => setAdding(true)}>
              <span className="plus">+</span>
              <strong>Add explorer</strong>
            </button>
          )}
        </div>
      )}

      {atCap && !adding && <p className="muted">Three explorers fill the camp. Switch kids from here anytime.</p>}

      {(adding || state.children.length === 0) && (
        <form
          className="panel form start-level-panel"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "add-child", name, coat, gradeBand });
            setName("");
            setGradeBand(DEFAULT_GRADE_BAND);
            setAdding(false);
          }}
        >
          <label>
            First name
            <input
              autoFocus
              maxLength={18}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pip’s friend"
            />
          </label>
          <p className="label">Where should we start?</p>
          <StartLevelPicker value={gradeBand} onChange={setGradeBand} />
          <p className="label">Fox coat</p>
          <div className="coat-row">
            {COAT_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.id}
                className={`coat-pick ${coat === opt.id ? "is-on" : ""}`}
                onClick={() => setCoat(opt.id)}
              >
                <Pip coat={opt.id} pose="sit" size={72} />
                {opt.name}
              </button>
            ))}
          </div>
          <div className="row-actions">
            {state.children.length > 0 && (
              <button type="button" className="btn ghost" onClick={() => setAdding(false)}>
                Cancel
              </button>
            )}
            <button className="btn primary" type="submit" disabled={!name.trim() || atCap}>
              Let’s go
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

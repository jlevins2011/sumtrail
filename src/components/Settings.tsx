import { describeStartLevel, resolveStartLevel } from "../lib/startLevel";
import { useActiveChild, useStore } from "../store/StoreContext";
import { StartLevelPicker } from "./StartLevelPicker";

export function Settings() {
  const { state, dispatch } = useStore();
  const child = useActiveChild();

  return (
    <div className="screen settings">
      <button className="text-back" onClick={() => dispatch({ type: "go", view: { name: "map" } })}>
        ← Camps
      </button>
      <h1>Settings</h1>
      {child && <p className="lede">Playing as {child.name}.</p>}
      {child && (
        <div className="panel form start-level-panel">
          <p className="label">Starting practice</p>
          <p className="tip">Camps at or below this stay open for review. Later camps still unlock in order.</p>
          <StartLevelPicker
            value={resolveStartLevel(child).gradeBand}
            onChange={(gradeBand) => dispatch({ type: "set-start-level", id: child.id, gradeBand })}
          />
          <p className="tip">Now starting at {describeStartLevel(child)}.</p>
        </div>
      )}
      <div className="panel form">
        <label className="toggle">
          <input
            type="checkbox"
            checked={state.settings.sound}
            onChange={(e) => dispatch({ type: "settings", patch: { sound: e.target.checked } })}
          />
          Sounds
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={state.settings.highContrast}
            onChange={(e) => dispatch({ type: "settings", patch: { highContrast: e.target.checked } })}
          />
          High contrast
        </label>
        <p className="tip">
          The lantern timer is kind: if it dims, Pip just waits. Nobody loses a turn for thinking.
        </p>
      </div>
      <div className="row-actions">
        <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "profiles" } })}>
          Switch explorer
        </button>
        <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "parent-gate" } })}>
          Parent reports
        </button>
      </div>
    </div>
  );
}

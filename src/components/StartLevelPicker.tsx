import { START_LEVELS } from "../lib/startLevel";
import type { GradeBand } from "../types";

export function StartLevelPicker({
  value,
  onChange,
}: {
  value: GradeBand;
  onChange: (gradeBand: GradeBand) => void;
}) {
  return (
    <><p className="tip">Choose the facts your child needs. These are practice levels, not a full grade curriculum. Kindergarten fluency is within 5; Ember Grove starts there and grows to Grade 1 facts within 10. Tables through 12 are extensions. Older learners can choose mixed review.</p><div className="start-level-list" role="radiogroup" aria-label="Starting practice or camp">
      {START_LEVELS.map((level) => (
        <button
          key={level.gradeBand}
          type="button"
          role="radio"
          aria-checked={value === level.gradeBand}
          className={`start-level-pick ${value === level.gradeBand ? "is-on" : ""}`}
          onClick={() => onChange(level.gradeBand)}
        >
          <span className="start-level-grade">{level.label}</span>
          <span className="start-level-camp">{level.campName}</span>
          <small>{level.blurb}</small>
        </button>
      ))}
    </div></>
  );
}

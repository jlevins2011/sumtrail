import { unlockAudio } from "../lib/audio";
import { isDemoMode } from "../lib/demo";
import { useStore } from "../store/StoreContext";
import { APP_VERSION } from "../version";
import { Pip } from "./Pip";

export function TitleScreen() {
  const { state, dispatch } = useStore();
  const demo = isDemoMode();
  return (
    <div className="screen title-screen">
      <div className="fireflies" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="firefly" style={{ ["--i" as string]: i }} />
        ))}
      </div>
      <header className="title-hero">
        <Pip coat="ember" pose="sit" size={140} />
        <p className="eyebrow">An original math facts adventure</p>
        <h1>Sumtrail</h1>
        <p className="lede">
          Light the number path with Pip the lantern fox. Add, subtract, multiply, and divide — kind timers, stars, and a
          journal of number-sense tips.
        </p>
        {demo && <p className="demo-banner">Demo path: Ember Grove only.</p>}
        <div className="title-actions">
          <button
            className="btn primary"
            onClick={() => {
              unlockAudio();
              dispatch({ type: "go", view: { name: "profiles" } });
            }}
          >
            {state.children.length ? "Play" : "Start adventure"}
          </button>
          <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "parent-gate" } })}>
            Parent reports
          </button>
        </div>
        <p className="app-version">Version {APP_VERSION}</p>
      </header>
      <ul className="title-points">
        <li>Five camps: Ember Grove through Night Sum Summit</li>
        <li>Timed-but-kind prompts — misses show the answer and move on</li>
        <li>Maggie the beagle pops in if a streak gets bumpy</li>
        <li>PIN-protected grown-up reports, same as Keytrail and Camp Compass</li>
      </ul>
    </div>
  );
}

import { unlockAudio } from "../lib/audio";
import { isDemoMode } from "../lib/demo";
import { useStore } from "../store/StoreContext";
import { APP_VERSION } from "../version";
import { BridgeJourney } from "./BridgeJourney";
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
          Practice math facts with Pip. Each correct answer lights a lantern. Finish trails to reach the campfire and earn a new lantern glow.
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
      <BridgeJourney coat="ember" mood="dawn" total={8} outcomes={[true,true,true]} />
      <ul className="title-points">
        <li>{demo ? "Demo: four trails and a workshop in Ember Grove" : "Five camps: addition and subtraction through multiplication and division"}</li>
        <li>{demo ? "Build addition and subtraction facts in the stone workshop" : "Build stones, plant arrays, and share berries in hands-on workshops"}</li>
        <li>Saved trails, guided corrections, and lanterns you can make your own</li>
        <li>PIN-protected grown-up reports, same as Keytrail and Camp Compass</li>
      </ul>
    </div>
  );
}

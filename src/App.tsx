import { useLayoutEffect } from "react";
import { Workshop } from "./components/Workshop";
import { Journal } from "./components/Journal";
import { LessonView } from "./components/LessonView";
import { ParentDashboard } from "./components/ParentDashboard";
import { ParentGate } from "./components/ParentGate";
import { ProfileSelect } from "./components/ProfileSelect";
import { Results } from "./components/Results";
import { Settings } from "./components/Settings";
import { StartLevelScreen } from "./components/StartLevelScreen";
import { TitleScreen } from "./components/TitleScreen";
import { TrailMap } from "./components/TrailMap";
import { useStore } from "./store/StoreContext";

export function App() {
  const { state } = useStore();
  const view = state.view;
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [view]);

  return (
    <div className={`app ${state.settings.highContrast ? "contrast" : ""}`}>
      {view.name === "title" && <TitleScreen />}
      {view.name === "profiles" && <ProfileSelect />}
      {view.name === "start-level" && <StartLevelScreen />}
      {view.name === "map" && <TrailMap />}
      {view.name === "workshop" && <Workshop key={view.worldId} worldId={view.worldId} />}
      {view.name === "lesson" && <LessonView key={view.lessonId} lessonId={view.lessonId} />}
      {view.name === "results" && <Results lessonId={view.lessonId} sessionId={view.sessionId} />}
      {view.name === "parent-gate" && <ParentGate />}
      {view.name === "parent" && <ParentDashboard />}
      {view.name === "settings" && <Settings />}
      {view.name === "journal" && <Journal />}
    </div>
  );
}

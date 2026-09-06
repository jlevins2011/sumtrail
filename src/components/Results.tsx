import { useEffect } from "react";
import { getLesson, nextLessonId, WORLDS } from "../data/curriculum";
import { LANTERNS } from "../lib/keepsakes";
import { sounds } from "../lib/audio";
import { isDemoMode, isWorldPlayable } from "../lib/demo";
import { formatDuration } from "../lib/stats";
import { useActiveChild, useStore } from "../store/StoreContext";
import { Pip } from "./Pip";

export function Results({ lessonId, sessionId }: { lessonId: string; sessionId: string }) {
  const { state, dispatch } = useStore();
  const child = useActiveChild();
  const lesson = getLesson(lessonId);
  const session = child?.sessions.find((item) => item.id === sessionId);
  const demo = isDemoMode();
  const rawNext = nextLessonId(lessonId);
  const next = rawNext && isWorldPlayable(getLesson(rawNext)?.worldId ?? "", demo) ? rawNext : null;

  useEffect(() => {
    if (session?.passed && state.settings.sound) sounds.star();
  }, [session?.passed, state.settings.sound]);

  if (!child || !lesson || !session) return null;
  const world = WORLDS.find((w) => w.id === lesson.worldId);
  const campJustCleared = session.passed && lesson.clearsCamp && child.campsCleared.includes(lesson.worldId);

  let headline = "Pip is proud of that practice.";
  let body = "Every run lights a little more of the trail.";
  if (session.passed && session.stars >= 3) {
    headline = "Lanterns blazing!";
    body = "Smooth and sure. That was a keeper’s run.";
  } else if (session.passed && session.stars === 2) {
    headline = "The camp is bright.";
    body = "Great accuracy. One more smooth trail and the third star is yours.";
  } else if (session.passed) {
    headline = "Path unlocked.";
    body = "You hit the score Pip needed. Replay for more stars whenever you like.";
  } else if (lesson.kind === "exam") {
    headline = "Summit still waiting.";
    body = `Aim for ${lesson.goals.accuracy}% accuracy. Warm up on Night warm-up, then try again.`;
  } else {
    headline = "A little practice, a brighter path.";
    body = `Try to land ${lesson.goals.accuracy}% accuracy. The trail does not go anywhere.`;
  }

  return (
    <div className="screen results">
      <p className="eyebrow">
        {world?.name} · Trail {lesson.number}
      </p>
      <Pip coat={child.coat} pose={session.passed ? "celebrate" : "sit"} size={120} />
      <h1>{headline}</h1>
      <p className="lede">{body}</p>
      {campJustCleared && (
        <p className="credit-toast">
          Campfire earned! {LANTERNS.find(l=>l.camp===lesson.worldId)?.name} is available at camp.
        </p>
      )}
      <div className="star-row" aria-label={`${session.stars} stars`}>
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= session.stars ? "star on" : "star"}>
            ★
          </span>
        ))}
      </div>
      <div className="stat-grid">
        <div>
          <b>{session.accuracy}%</b>
          <span>first-answer accuracy</span>
        </div>
        <div>
          <b>{session.correct}</b>
          <span>lanterns lit</span>
        </div>
        <div>
          <b>{session.errors}</b>
          <span>misses</span>
        </div>
        <div>
          <b>{formatDuration(session.durationMs)}</b>
          <span>time</span>
        </div>
      </div>
      {!!session.correctedFacts?.length && <p className="correction-summary">You worked through {session.correctedFacts.length} fact{session.correctedFacts.length===1?'':'s'} with help. Those corrections are recorded separately from your first answers.</p>}
      <div className="row-actions">
        <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "map" } })}>
          Camps
        </button>
        <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "workshop", worldId:lesson.worldId } })}>Practice in the workshop</button>
        <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "lesson", lessonId } })}>
          Try again
        </button>
        {session.passed && next && (
          <button className="btn primary" onClick={() => dispatch({ type: "go", view: { name: "lesson", lessonId: next } })}>
            Next trail
          </button>
        )}
        {session.passed && !next && (
          <button className="btn primary" onClick={() => dispatch({ type: "go", view: { name: "map" } })}>
            {demo ? "Ember Grove complete" : "Back to camps"}
          </button>
        )}
      </div>
    </div>
  );
}

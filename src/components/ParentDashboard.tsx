import { familyExport } from "../lib/familyServices";
import { useMemo, useState } from "react";
import { getLesson, LESSONS } from "../data/curriculum";
import {
  accuracyByOperation,
  average,
  formatDuration,
  isNightSumKeeper,
  practiceMs,
  practiceStreak,
  progressPercent,
  recentSessions,
  startOfDay,
  startOfWeek,
  totalStars,
  uniqueFactsPracticed,
  weakFacts,
} from "../lib/stats";
import { describeStartLevel, hasChosenStartLevel } from "../lib/startLevel";
import { useStore } from "../store/StoreContext";
import type { Operation } from "../types";
import { Pip } from "./Pip";

const OP_LABEL: Record<Operation, string> = {
  add: "Add",
  sub: "Subtract",
  mul: "Multiply",
  div: "Divide",
};

function prettyFact(key: string): string {
  const [op, a, b] = key.split("-");
  const symbol = op === "add" ? "+" : op === "sub" ? "−" : op === "mul" ? "×" : "÷";
  return `${a} ${symbol} ${b}`;
}

export function ParentDashboard() {
  const { state, dispatch } = useStore();
  const [childId, setChildId] = useState(state.activeChildId ?? state.children[0]?.id ?? "");
  const child = state.children.find((c) => c.id === childId) ?? state.children[0];
  const ops = useMemo(() => (child ? accuracyByOperation(child) : null), [child]);
  const recent = child ? recentSessions(child, 10) : [];
  const weak = child ? weakFacts(child) : [];
  const avgAcc = child ? average(child.sessions.map((s) => s.accuracy)) : 0;

  return (
    <div className="screen parent">
      <header className="map-top">
        <button className="text-back" onClick={() => dispatch({ type: "go", view: { name: "title" } })}>
          ← Home
        </button>
        <h1>Parent reports</h1>
        <button className="btn ghost print-hide" onClick={() => window.print()}>
          Print
        </button>
      </header>

      {state.children.length === 0 && <p className="lede">No explorers yet. Start an adventure from the home screen.</p>}

      {child && ops && (
        <>
          <div className="parent-pick print-hide">
            {state.children.map((c) => (
              <button key={c.id} className={c.id === child.id ? "chip on" : "chip"} onClick={() => setChildId(c.id)}>
                {c.name}
              </button>
            ))}
          </div>

          <button className="btn ghost print-hide" onClick={()=>{
            const blob=new Blob([JSON.stringify(familyExport(child),null,2)],{type:'application/json'});
            const url=URL.createObjectURL(blob); const a=document.createElement('a');
            a.href=url;a.download='sumtrail-learning-records.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
          }}>Export this child’s learning records</button>
          <section className="parent-hero panel">
            <Pip coat={child.coat} pose="sit" size={88} />
            <div>
              <h2>{child.name}</h2>
              <p>
                Starts at {hasChosenStartLevel(child) ? describeStartLevel(child) : "Ember Grove (not set yet)"}
                {" · "}
                {progressPercent(child)}% of Sumtrail complete
                {isNightSumKeeper(child) ? " · Night Sum keeper" : ""}
                {child.campsCleared.length ? ` · ${child.campsCleared.length} camps cleared` : ""}
              </p>
            </div>
          </section>

          <div className="stat-grid">
            <div>
              <b>{formatDuration(practiceMs(child.sessions, startOfDay()))}</b>
              <span>today</span>
            </div>
            <div>
              <b>{formatDuration(practiceMs(child.sessions, startOfWeek()))}</b>
              <span>this week</span>
            </div>
            <div>
              <b>{formatDuration(practiceMs(child.sessions))}</b>
              <span>all time</span>
            </div>
            <div>
              <b>{practiceStreak(child.sessions)}</b>
              <span>day streak</span>
            </div>
            <div>
              <b>{Math.round(avgAcc)}%</b>
              <span>avg accuracy</span>
            </div>
            <div>
              <b>{uniqueFactsPracticed(child)}</b>
              <span>facts practiced</span>
            </div>
            <div>
              <b>{totalStars(child)}</b>
              <span>stars</span>
            </div>
            <div>
              <b>{child.sessions.length}</b>
              <span>runs</span>
            </div>
          </div>

          <section className="panel">
            <h3>Accuracy by operation</h3>
            <p className="muted">First answers only. Visual corrections and workshop exploration never increase these scores.</p>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Correct</th>
                  <th>Misses</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {(["add", "sub", "mul", "div"] as Operation[]).map((op) => (
                  <tr key={op}>
                    <td>{OP_LABEL[op]}</td>
                    <td>{ops[op].correct}</td>
                    <td>{ops[op].errors}</td>
                    <td>{ops[op].correct + ops[op].errors ? `${ops[op].accuracy}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel">
            <h3>Facts that need love</h3>
            {weak.length === 0 ? (
              <p className="muted">Not enough misses to pick on anyone yet.</p>
            ) : (
              <ul className="weak-list">
                {weak.map((item) => (
                  <li key={item.key}>
                    <b>{prettyFact(item.key)}</b> {item.misses} misses
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <h3>Trails</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Trail</th>
                  <th>Stars</th>
                  <th>Best accuracy</th>
                  <th>Tries</th>
                </tr>
              </thead>
              <tbody>
                {LESSONS.map((lesson) => {
                  const rec = child.completedLessons[lesson.id];
                  return (
                    <tr key={lesson.id}>
                      <td>{lesson.number}</td>
                      <td>{lesson.title}</td>
                      <td>{rec ? "★".repeat(rec.stars) : "—"}</td>
                      <td>{rec ? `${rec.bestAccuracy}%` : "—"}</td>
                      <td>{rec?.attempts ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="panel">
            <h3>Recent runs</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Trail</th>
                  <th>Accuracy</th>
                  <th>Corrections</th>
                  <th>Stars</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((session) => (
                  <tr key={session.id}>
                    <td>{new Date(session.startedAt).toLocaleString()}</td>
                    <td>{getLesson(session.lessonId)?.title ?? session.lessonId}</td>
                    <td>{session.accuracy}%</td>
                    <td>{session.correctedFacts?.length ?? 0}</td>
                    <td>{session.passed ? "★".repeat(session.stars) : "retry"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="fine">
            Progress stays on this device. Export learning records for your own backup or a future family website. Shared accounts and Lumen Isles rewards are not connected yet. Older local credit records are preserved; new campfires earn usable lantern styles.
          </p>
        </>
      )}
    </div>
  );
}

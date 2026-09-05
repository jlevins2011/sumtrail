import { useEffect, useMemo, useRef, useState } from "react";
import { getLesson, getWorld } from "../data/curriculum";
import { sounds } from "../lib/audio";
import { answersMatch } from "../lib/engine";
import { buildRound } from "../lib/facts";
import { emptyOperationTally } from "../lib/storage";
import { useActiveChild, useStore } from "../store/StoreContext";
import { KIND_WINDOW_MS, type Fact, type JournalEntry, type Operation } from "../types";
import { Keypad } from "./Keypad";
import { Maggie } from "./Maggie";
import { Pip } from "./Pip";

type Phase = "intro" | "ask" | "feedback";

export function LessonView({ lessonId }: { lessonId: string }) {
  const { state, dispatch } = useStore();
  const child = useActiveChild();
  const lesson = getLesson(lessonId);
  const world = lesson ? getWorld(lesson.worldId) : undefined;
  const facts = useMemo(() => (lesson ? buildRound(lesson.bank, lesson.questionCount) : []), [lesson]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [missStreak, setMissStreak] = useState(0);
  const [showMaggie, setShowMaggie] = useState(false);
  const [hit, setHit] = useState<boolean | null>(null);
  const [slow, setSlow] = useState(false);
  const [kindLeft, setKindLeft] = useState(1);
  const [startedAt] = useState(() => Date.now());
  const askedAt = useRef(Date.now());
  const responseMs = useRef<number[]>([]);
  const factErrors = useRef<Record<string, number>>({});
  const opCorrect = useRef(emptyOperationTally());
  const opErrors = useRef(emptyOperationTally());
  const factsFound = useRef<string[]>([]);
  const journal = useRef<JournalEntry[]>([]);
  const finishedRef = useRef(false);

  const fact: Fact | undefined = facts[index];

  useEffect(() => {
    if (phase !== "ask") return;
    askedAt.current = Date.now();
    setSlow(false);
    setKindLeft(1);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(0, 1 - (Date.now() - started) / KIND_WINDOW_MS);
      setKindLeft(left);
      if (left <= 0) setSlow(true);
    }, 80);
    return () => window.clearInterval(tick);
  }, [phase, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "ask") return;
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setTyped((prev) => (prev.length < 4 ? prev + e.key : prev));
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setTyped((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!child || !lesson || !world) return null;

  function play(kind: keyof typeof sounds) {
    if (state.settings.sound) sounds[kind]();
  }

  function submit() {
    if (phase !== "ask" || !fact) return;
    if (!typed.length) return;
    const ok = answersMatch(typed, fact.answer);
    const elapsed = Date.now() - askedAt.current;
    if (ok) responseMs.current.push(elapsed);
    bump(fact.op, ok);
    if (!ok) {
      factErrors.current[fact.id] = (factErrors.current[fact.id] ?? 0) + 1;
      setErrors((n) => n + 1);
      setMissStreak((n) => {
        const next = n + 1;
        if (next >= 3) setShowMaggie(true);
        return next;
      });
      play("miss");
    } else {
      setCorrect((n) => n + 1);
      setMissStreak(0);
      factsFound.current = [...new Set([...factsFound.current, fact.id])];
      if (!journal.current.some((entry) => entry.id === fact.id)) {
        journal.current.push({ id: fact.id, prompt: fact.prompt, tip: fact.tip, op: fact.op });
      }
      play(elapsed < 2500 ? "combo" : "correct");
    }
    setHit(ok);
    setPhase("feedback");
  }

  function bump(op: Operation, ok: boolean) {
    if (ok) opCorrect.current[op] += 1;
    else opErrors.current[op] += 1;
  }

  function finishRound() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    dispatch({
      type: "record-session",
      lessonId,
      durationMs: Date.now() - startedAt,
      correct,
      errors,
      factErrors: { ...factErrors.current },
      operationCorrect: { ...opCorrect.current },
      operationErrors: { ...opErrors.current },
      factsFound: factsFound.current,
      journal: journal.current,
      responseMs: responseMs.current,
      finished: true,
    });
  }

  function nextFact() {
    if (index + 1 >= facts.length) {
      finishRound();
      return;
    }
    setIndex((n) => n + 1);
    setTyped("");
    setHit(null);
    setPhase("ask");
  }

  const pose = phase === "feedback" ? (hit ? "celebrate" : "stumble") : phase === "ask" ? "run" : "sit";

  return (
    <div className="screen lesson">
      <header className="lesson-top">
        <button className="text-back" onClick={() => dispatch({ type: "go", view: { name: "map" } })}>
          ← Camps
        </button>
        <div>
          <p className="eyebrow">
            {world.name} · Trail {lesson.number}
          </p>
          <h1>{lesson.title}</h1>
        </div>
        <div className="hud">
          <span>
            Lit <b>{correct}</b>
          </span>
          <span>
            Miss <b>{errors}</b>
          </span>
        </div>
      </header>

      {phase === "intro" && (
        <section className="panel intro">
          <Pip coat={child.coat} pose="sit" size={100} />
          <p>{lesson.intro}</p>
          <p className="tip">{lesson.tip}</p>
          <p className="goal">
            {lesson.questionCount} lanterns · pass at {lesson.goals.accuracy}% · the timer is kind
          </p>
          <button
            className="btn primary"
            onClick={() => {
              play("start");
              askedAt.current = Date.now();
              setPhase("ask");
            }}
          >
            Start trail
          </button>
        </section>
      )}

      {phase !== "intro" && fact && (
        <div className={`play-card panel mood-${world.mood}`}>
          <div className="play-hero">
            <Pip coat={child.coat} pose={pose} size={96} />
            {showMaggie && <Maggie size={72} />}
          </div>
          <div className="lantern-row" aria-hidden="true">
            {facts.map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className={`ground-lantern ${i < index || (i === index && hit === true) ? "is-lit" : ""} ${i === index && hit === false ? "is-miss" : ""}`}
              />
            ))}
          </div>
          <p className="fact-prompt" data-testid="fact-prompt">
            {fact.prompt} =
          </p>
          <div className={`answer-box ${hit === false ? "is-miss" : ""} ${hit === true ? "is-hit" : ""}`}>
            {typed || (phase === "ask" ? " " : String(fact.answer))}
          </div>
          <div className="kind-bar" aria-hidden="true">
            <span style={{ width: `${Math.round(kindLeft * 100)}%` }} className={slow ? "is-slow" : ""} />
          </div>
          <p className="kind-note">{slow ? "Take your time — Pip is waiting." : "Kind lantern. No rush."}</p>

          {phase === "ask" && (
            <Keypad
              onDigit={(d) => setTyped((prev) => (prev.length < 4 ? prev + d : prev))}
              onBackspace={() => setTyped((prev) => prev.slice(0, -1))}
              onSubmit={submit}
            />
          )}

          {phase === "feedback" && (
            <div className={`feedback ${hit ? "is-hit" : "is-miss"}`}>
              <p className="feedback-line">
                {hit ? "Lantern lit!" : `The path says ${fact.prompt} = ${fact.answer}.`}
              </p>
              <p className="tip">{fact.tip}</p>
              {showMaggie && missStreak >= 3 && (
                <p className="maggie-line">Maggie wagged over: you are still on the trail. Next stone.</p>
              )}
              <button className="btn primary" onClick={nextFact}>
                {index + 1 >= facts.length ? "See camp stars" : "Next lantern"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

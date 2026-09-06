import { useEffect, useMemo, useRef, useState } from "react";
import { getLesson, getWorld } from "../data/curriculum";
import { sounds } from "../lib/audio";
import { answersMatch } from "../lib/engine";
import { buildRound } from "../lib/facts";
import { emptyOperationTally, newId } from "../lib/storage";
import { useActiveChild, useStore } from "../store/StoreContext";
import { KIND_WINDOW_MS, type Fact, type JournalEntry, type Operation } from "../types";
import { Keypad } from "./Keypad";
import { Maggie } from "./Maggie";
import { BridgeJourney } from "./BridgeJourney";
import { PracticeClock } from "../lib/practiceClock";
import { readDraft, saveDraft, lastSession } from "../lib/trailDraft";
import { MathEncounter } from "./MathEncounter";
import { Pip } from "./Pip";

type Phase = "intro" | "ask" | "feedback";

export function LessonView({ lessonId }: { lessonId: string }) {
  const { state, dispatch } = useStore();
  const child = useActiveChild();
  const lesson = getLesson(lessonId);
  const world = lesson ? getWorld(lesson.worldId) : undefined;
  const [draft] = useState(() => child && lesson ? readDraft(child, lesson) : null);
  const [sessionId] = useState(() => draft?.sessionId ?? newId());
  const startedAt = useRef(draft?.startedAt ?? Date.now());
  const facts = useMemo(() => (draft?.facts ?? (lesson ? buildRound(lesson.bank, lesson.questionCount) : [])), [lesson]);

  const [phase, setPhase] = useState<Phase>(draft?.phase ?? "intro");
  const [index, setIndex] = useState(draft ? draft.outcomes.length - (draft.phase === "feedback" ? 1 : 0) : 0);
  const [typed, setTyped] = useState(draft?.typed ?? "");
  const [correct, setCorrect] = useState(draft?.outcomes.filter(Boolean).length ?? 0);
  const [errors, setErrors] = useState(draft?.outcomes.filter(v => !v).length ?? 0);
  const [missStreak, setMissStreak] = useState(draft ? draft.outcomes.length - draft.outcomes.lastIndexOf(true) - 1 : 0);
  const [showMaggie, setShowMaggie] = useState(draft ? draft.outcomes.length - draft.outcomes.lastIndexOf(true) - 1 >= 3 : false);
  const [hit, setHit] = useState<boolean | null>(draft?.phase === "feedback" ? draft.outcomes.at(-1)! : null);
  const [slow, setSlow] = useState(false);
  const [kindLeft, setKindLeft] = useState(1);
  const [outcomes, setOutcomes] = useState<boolean[]>(draft?.outcomes ?? []);
  const [paused, setPaused] = useState(!!draft);
  const [saveFailed, setSaveFailed] = useState(false);
  const [correction,setCorrection] = useState(draft?.correction ?? {steps:0,typed:'',open:false,done:false});
  const [correctedFacts,setCorrectedFacts] = useState<string[]>(draft?.correctedFacts ?? []);
  const [retryMessage,setRetryMessage] = useState('');
  const clock = useRef(new PracticeClock(undefined, draft?.elapsed ?? 0));
  const submitted = useRef(draft?.phase === "feedback");
  const askedAt = useRef(draft?.askedAt ?? 0);
  const responseMs = useRef<number[]>(draft?.responseMs ?? []);
  const factErrors = useRef<Record<string, number>>({});
  const opCorrect = useRef(emptyOperationTally());
  const opErrors = useRef(emptyOperationTally());
  const factsFound = useRef<string[]>([]);
  const journal = useRef<JournalEntry[]>([]);
  const finishedRef = useRef(false);

  const restored = useRef(false);
  if (!restored.current) {
    restored.current = true;
    draft?.outcomes.forEach((ok, i) => {
      const f = facts[i];
      if (ok) {
        opCorrect.current[f.op]++;
        if (!factsFound.current.includes(f.id)) {
          factsFound.current.push(f.id);
          journal.current.push({ id: f.id, prompt: f.prompt, tip: f.tip, op: f.op });
        }
      } else {
        opErrors.current[f.op]++;
        factErrors.current[f.id] = (factErrors.current[f.id] ?? 0) + 1;
      }
    });
  }
  const fact: Fact | undefined = facts[index];

  useEffect(() => {
    if (phase !== "ask") return;
    setSlow(false);
    setKindLeft(1);
    const started = askedAt.current;
    const tick = window.setInterval(() => {
      const left = Math.max(0, 1 - (clock.current.elapsed() - started) / KIND_WINDOW_MS);
      setKindLeft(left);
      if (left <= 0) setSlow(true);
    }, 80);
    return () => window.clearInterval(tick);
  }, [phase, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && phase !== "intro") { e.preventDefault(); pause(); return; }
      if ((e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) || phase !== "ask" || paused || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
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

  useEffect(() => {
    const hide = () => { if (document.hidden) pause(); };
    const blur = () => pause();
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", blur);
    return () => { document.removeEventListener("visibilitychange", hide); window.removeEventListener("blur", blur); };
  }, [phase]);

  useEffect(() => {
    if (!child || phase === "intro") return;
    const persist = () => {
      if (finishedRef.current) return;
      setSaveFailed(!saveDraft(child.id, {
        version: 1, lessonId, sessionId, startedAt:startedAt.current, priorSessionId: draft?.priorSessionId ?? lastSession(child, lessonId),
        facts, outcomes, typed, phase, correction, correctedFacts, elapsed: clock.current.elapsed(), askedAt: askedAt.current,
        responseMs: responseMs.current,
      }));
    };
    persist();
    const timer = window.setInterval(persist, 1000);
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", persist);
      persist();
    };
  }, [child, phase, index, typed, outcomes, paused, correction, correctedFacts]);

  function leaveTrail() {
    clock.current.pause();
    dispatch({ type: "go", view: { name: "map" } });
  }

  function pause() {
    if (phase === "intro") return;
    clock.current.pause();
    if (phase === "ask") setKindLeft(Math.max(0, 1 - (clock.current.elapsed() - askedAt.current) / KIND_WINDOW_MS));
    setPaused(true);
  }

  if (!child || !lesson || !world) return null;

  function play(kind: keyof typeof sounds) {
    if (state.settings.sound) sounds[kind]();
  }

  function submit() {
    if (phase !== "ask" || !fact || paused || submitted.current) return;
    if (!typed.length) return;
    submitted.current = true;
    const ok = answersMatch(typed, fact.answer);
    const elapsed = clock.current.elapsed() - askedAt.current;
    setOutcomes(previous => [...previous, ok]);
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
      lessonId, sessionId, startedAt:startedAt.current,
      durationMs: clock.current.elapsed(),
      correct,
      errors,
      factErrors: { ...factErrors.current },
      operationCorrect: { ...opCorrect.current },
      operationErrors: { ...opErrors.current },
      factsFound: factsFound.current,
      journal: journal.current,
      responseMs: responseMs.current,
      correctedFacts,
      finished: true,
    });
  }

  function nextFact() {
    if (paused) return;
    submitted.current = false;
    if (index + 1 >= facts.length) {
      finishRound();
      return;
    }
    askedAt.current = clock.current.elapsed();
    setIndex((n) => n + 1);
    setTyped("");
    setCorrection({steps:0,typed:"",open:false,done:false});
    setRetryMessage("");
    setHit(null);
    setPhase("ask");
  }



  return (
    <div className="screen lesson">
      <div inert={paused}>
      {saveFailed && <p role="alert">This browser could not save your trail. Keep this page open to finish the round.</p>}
      <header className="lesson-top">
        <button className="text-back" onClick={leaveTrail}>
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
          {phase !== "intro" && <button className="btn ghost" onClick={pause}>Pause</button>}
        </div>
      </header>

      {phase === "intro" && (
        <section className="panel intro">
          <Pip coat={child.coat} pose="sit" size={100} />
          <p>{lesson.intro}</p>
          <p className="tip">{lesson.tip}</p>
          <p className="goal">
            {lesson.questionCount} lanterns · pass at {lesson.goals.accuracy}% · take as much time as you need
          </p>
          <button
            className="btn primary"
            onClick={() => {
              startedAt.current = Date.now();
              play("start");
              clock.current.resume();
              askedAt.current = clock.current.elapsed();
              setPhase("ask");
            }}
          >
            Start trail
          </button>
        </section>
      )}

      {phase !== "intro" && fact && (
        <div className={`play-card panel mood-${world.mood}`}>
          <BridgeJourney lanternStyle={child.lanternStyle} coat={child.coat} mood={world.mood} total={facts.length} outcomes={outcomes} />
          <p className="trail-step">LANTERN {index + 1} OF {facts.length} · {correct} LIT</p>
          <p className="fact-prompt" data-testid="fact-prompt">
            {fact.prompt} =
          </p>
          <div role="status" aria-label="Your answer" className={`answer-box ${hit === false ? "is-miss" : ""} ${hit === true ? "is-hit" : ""}`}>
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
            <div aria-live="polite" className={`feedback ${hit ? "is-hit" : "is-miss"}`}>
              <p className="feedback-line">
                {hit ? "Lantern lit!" : `The path says ${fact.prompt} = ${fact.answer}.`}
              </p>
              <p className="tip">{fact.tip}</p>
              {hit === false && <div className="correction-panel">
                {!correction.open && <button className="btn model-reset" onClick={()=>setCorrection(c=>({...c,open:true}))}>Work it out together</button>}
                {correction.open && <>
                  <MathEncounter fact={fact} steps={correction.steps} onStep={steps=>setCorrection(c=>({...c,steps}))}/>
                  {!correction.done ? <form className="retry-form" onSubmit={e=>{
                    e.preventDefault();
                    if (answersMatch(correction.typed,fact.answer)) {
                      setCorrection(c=>({...c,done:true}));
                      setCorrectedFacts(ids=>[...new Set([...ids,fact.id])]);
                      setRetryMessage('You worked it out! This is recorded as a correction.');
                      play('correct');
                    } else setRetryMessage('Look at the model and try again. You can also move to the next lantern.');
                  }}><label>Try this fact again<input inputMode="numeric" pattern="[0-9]*" maxLength={4} value={correction.typed} onChange={e=>setCorrection(c=>({...c,typed:e.target.value.replace(/[^0-9]/g,'')}))}/></label><button className="btn primary" disabled={!correction.typed}>Check correction</button></form> : <p className="corrected-note">✓ Worked out together</p>}
                  <p role="status">{retryMessage}</p>
                  <small>Practice helps you learn. Your first answer stays in the trail score.</small>
                </>}
              </div>}
              {showMaggie && missStreak >= 3 && (
                <p className="maggie-line"><Maggie size={60} />Maggie wagged over: you are still on the trail. Next stone.</p>
              )}
              <button className="btn primary" onClick={nextFact}>
                {index + 1 >= facts.length ? "See camp stars" : "Next lantern"}
              </button>
            </div>
          )}
        </div>
      )}
      </div>
      {paused && <div className="pause-veil"><section className="panel pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-title" onKeyDown={e => {
        if (e.key !== "Tab") return;
        const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
        if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons[1].focus(); }
        else if (!e.shiftKey && document.activeElement === buttons[1]) { e.preventDefault(); buttons[0].focus(); }
      }}>
        <Pip coat={child.coat} pose="sit" size={100} />
        <h2 id="pause-title">Rest by the river</h2>
        <p>Your trail is waiting. Take your time.</p>
        <button autoFocus className="btn primary" onClick={() => { clock.current.resume(); setPaused(false); }}>Continue trail</button>
        <button className="btn" onClick={leaveTrail}>Return to camps</button>
        <small>{saveFailed ? "Saving is unavailable. Stay on this page to keep your progress." : "Your unfinished trail is saved on this device. Open this trail to continue."}</small>
      </section></div>}
    </div>
  );
}

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from "react";
import { getLesson } from "../data/curriculum";
import { clearDraft } from "../lib/trailDraft";
import { setAudioEnabled } from "../lib/audio";
import { availableLanterns } from "../lib/keepsakes";
import { isDemoMode } from "../lib/demo";
import { evaluateRound } from "../lib/engine";
import {
  appendSession,
  createChild,
  emptyOperationTally,
  emptyStore,
  hashPin,
  loadStore,
  mergeLessonRecord,
  saveStore,
} from "../lib/storage";
import { hasChosenStartLevel, startLevelFor } from "../lib/startLevel";
import type { Coat, GradeBand, JournalEntry, Operation, Settings, StoreData, View } from "../types";
import { MAX_PROFILES } from "../types";

export type RecordSessionPayload = {
  lessonId: string;
  sessionId: string;
  startedAt: number;
  durationMs: number;
  correct: number;
  errors: number;
  factErrors: Record<string, number>;
  operationCorrect: Record<Operation, number>;
  operationErrors: Record<Operation, number>;
  factsFound: string[];
  journal: JournalEntry[];
  responseMs: number[];
  finished: boolean;
  correctedFacts?: string[];
};

type Action =
  | { type: "hydrate"; data: StoreData }
  | { type: "go"; view: View }
  | { type: "add-child"; name: string; coat: Coat; gradeBand: GradeBand }
  | { type: "select-child"; id: string }
  | { type: "set-start-level"; id: string; gradeBand: GradeBand }
  | { type: "delete-child"; id: string }
  | { type: "set-lantern"; id: string; lanternStyle: string }
  | { type: "set-pin"; pin: string }
  | { type: "clear-pin" }
  | { type: "settings"; patch: Partial<Settings> }
  | ({ type: "record-session" } & RecordSessionPayload);

type State = StoreData & { view: View };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.data };
    case "go":
      return { ...state, view: action.view };
    case "add-child": {
      if (state.children.length >= MAX_PROFILES) return state;
      const child = createChild(action.name, action.coat, action.gradeBand);
      return {
        ...state,
        children: [...state.children, child],
        activeChildId: child.id,
        view: { name: "map" },
      };
    }
    case "select-child": {
      const child = state.children.find((item) => item.id === action.id);
      const needsPlacement = child ? !hasChosenStartLevel(child) : false;
      return {
        ...state,
        activeChildId: action.id,
        view: { name: needsPlacement ? "start-level" : "map" },
      };
    }
    case "set-start-level": {
      const level = startLevelFor(action.gradeBand);
      return {
        ...state,
        children: state.children.map((child) =>
          child.id === action.id
            ? { ...child, gradeBand: level.gradeBand, startWorldId: level.campId }
            : child,
        ),
        view: state.view.name === "start-level" ? { name: "map" } : state.view,
      };
    }
    case "delete-child": {
      const children = state.children.filter((child) => child.id !== action.id);
      const activeChildId =
        state.activeChildId === action.id ? (children[0]?.id ?? null) : state.activeChildId;
      return { ...state, children, activeChildId };
    }
    case "set-lantern":
      return {...state,children:state.children.map(child=>child.id===action.id && availableLanterns(child).some(l=>l.id===action.lanternStyle) ? {...child,lanternStyle:action.lanternStyle} : child)};
    case "set-pin":
      return { ...state, parentPin: hashPin(action.pin) };
    case "clear-pin":
      return { ...state, parentPin: null };
    case "settings":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case "record-session": {
      const childId = state.activeChildId;
      if (!childId) return state;
      const lesson = getLesson(action.lessonId);
      if (!lesson) return state;
      if (state.children.find(c=>c.id===childId)?.sessions.some(s=>s.id===action.sessionId)) return state;
      const result = evaluateRound(lesson, action.correct, action.errors, action.responseMs);
      const passed = action.finished && result.passed;
      const session = {
        id: action.sessionId,
        childId,
        lessonId: action.lessonId,
        startedAt: action.startedAt,
        durationMs: action.durationMs,
        accuracy: result.accuracy,
        errors: action.errors,
        correct: action.correct,
        factErrors: action.factErrors,
        operationCorrect: action.operationCorrect ?? emptyOperationTally(),
        operationErrors: action.operationErrors ?? emptyOperationTally(),
        stars: passed ? result.stars : 0,
        passed,
        factsFound: action.factsFound,
        smoothness: result.smoothness,
        correctedFacts: action.correctedFacts ?? [],
      };
      return {
        ...state,
        children: state.children.map((child) => {
          if (child.id !== childId) return child;
          const updated = appendSession(child, session, action.journal);
          const current = updated.completedLessons[action.lessonId];
          let campsCleared = updated.campsCleared;
          if (passed && lesson.clearsCamp && !campsCleared.includes(lesson.worldId)) {
            campsCleared = [...campsCleared, lesson.worldId];
          }
          if (!passed) {
            return {
              ...updated,
              campsCleared,
              completedLessons: {
                ...updated.completedLessons,
                [action.lessonId]: {
                  stars: current?.stars ?? 0,
                  bestAccuracy: Math.max(current?.bestAccuracy ?? 0, result.accuracy),
                  attempts: (current?.attempts ?? 0) + 1,
                  completedAt: current?.completedAt ?? 0,
                },
              },
            };
          }
          return {
            ...updated,
            campsCleared,
            completedLessons: {
              ...updated.completedLessons,
              [action.lessonId]: mergeLessonRecord(current, {
                stars: result.stars,
                bestAccuracy: result.accuracy,
              }),
            },
          };
        }),
        view: { name: "results", lessonId: action.lessonId, sessionId: session.id },
      };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...emptyStore(), view: { name: "title" } });
  const [hydrated, setHydrated] = useState(false);
  const [saveError,setSaveError] = useState(false);

  useEffect(() => {
    dispatch({ type: "hydrate", data: loadStore() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const { version, parentPin, children: kids, activeChildId, settings } = state;
    try {
      saveStore({ version, parentPin, children: kids, activeChildId, settings });
      setSaveError(false);
      if(state.view.name==='results' && activeChildId) clearDraft(activeChildId,state.view.lessonId);
    } catch {setSaveError(true);}
  }, [state, hydrated]);

  useEffect(() => { setAudioEnabled(state.settings.sound); }, [state.settings.sound]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{saveError && <p role="alert" className="save-alert">This browser could not save progress. Keep this page open and free some browser storage before leaving.</p>}{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useActiveChild() {
  const { state } = useStore();
  return state.children.find((child) => child.id === state.activeChildId) ?? null;
}

export function useDemoFlag() {
  return isDemoMode();
}

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from "react";
import { getLesson } from "../data/curriculum";
import { earnCampCredits } from "../lib/credits";
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
  newId,
  saveStore,
} from "../lib/storage";
import type { Coat, JournalEntry, Operation, Settings, StoreData, View } from "../types";
import { MAX_PROFILES } from "../types";

export type RecordSessionPayload = {
  lessonId: string;
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
};

type Action =
  | { type: "hydrate"; data: StoreData }
  | { type: "go"; view: View }
  | { type: "add-child"; name: string; coat: Coat }
  | { type: "select-child"; id: string }
  | { type: "delete-child"; id: string }
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
      const child = createChild(action.name, action.coat);
      return {
        ...state,
        children: [...state.children, child],
        activeChildId: child.id,
        view: { name: "map" },
      };
    }
    case "select-child":
      return { ...state, activeChildId: action.id, view: { name: "map" } };
    case "delete-child": {
      const children = state.children.filter((child) => child.id !== action.id);
      const activeChildId =
        state.activeChildId === action.id ? (children[0]?.id ?? null) : state.activeChildId;
      return { ...state, children, activeChildId };
    }
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
      const result = evaluateRound(lesson, action.correct, action.errors, action.responseMs);
      const passed = action.finished && result.passed;
      const session = {
        id: newId(),
        childId,
        lessonId: action.lessonId,
        startedAt: Date.now() - action.durationMs,
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
            earnCampCredits(child.id, lesson.worldId);
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

  useEffect(() => {
    dispatch({ type: "hydrate", data: loadStore() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const { version, parentPin, children: kids, activeChildId, settings } = state;
    saveStore({ version, parentPin, children: kids, activeChildId, settings });
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
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

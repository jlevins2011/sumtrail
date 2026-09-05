export type Coat = "ember" | "snow" | "dusk" | "moss";

export type Operation = "add" | "sub" | "mul" | "div";

export type LessonKind = "guide" | "drill" | "mix" | "exam";

export type Mood = "dawn" | "day" | "dusk" | "fire" | "night";

export type View =
  | { name: "title" }
  | { name: "profiles" }
  | { name: "map" }
  | { name: "lesson"; lessonId: string }
  | { name: "results"; lessonId: string; sessionId: string }
  | { name: "parent-gate" }
  | { name: "parent" }
  | { name: "settings" }
  | { name: "journal" };

export type LessonGoals = {
  accuracy: number;
};

export type FactBank = {
  operations: Operation[];
  /** Inclusive max for addends / minuend (add/sub). */
  addMax?: number;
  /** Inclusive max for a single addend when addMax is set. */
  addendMax?: number;
  /** Multiplication factors to include (the other factor is 0–12). */
  mulFactors?: number[];
  /** Division divisors to include (quotients 0–12). */
  divDivisors?: number[];
};

export type Lesson = {
  id: string;
  worldId: string;
  number: number;
  title: string;
  tease: string;
  kind: LessonKind;
  bank: FactBank;
  questionCount: number;
  goals: LessonGoals;
  intro: string;
  tip: string;
  /** First clear of this lesson awards camp credits. */
  clearsCamp?: boolean;
};

export type World = {
  id: string;
  name: string;
  subtitle: string;
  mood: Mood;
  creditAmount: number;
};

export type Fact = {
  id: string;
  a: number;
  b: number;
  op: Operation;
  answer: number;
  prompt: string;
  tip: string;
};

export type JournalEntry = {
  id: string;
  prompt: string;
  tip: string;
  op: Operation;
};

export type LessonRecord = {
  stars: number;
  bestAccuracy: number;
  attempts: number;
  completedAt: number;
};

export type Session = {
  id: string;
  childId: string;
  lessonId: string;
  startedAt: number;
  durationMs: number;
  accuracy: number;
  errors: number;
  correct: number;
  factErrors: Record<string, number>;
  operationCorrect: Record<Operation, number>;
  operationErrors: Record<Operation, number>;
  stars: number;
  passed: boolean;
  factsFound: string[];
  smoothness: number;
};

export type Child = {
  id: string;
  name: string;
  coat: Coat;
  createdAt: number;
  completedLessons: Record<string, LessonRecord>;
  sessions: Session[];
  factsFound: string[];
  journal: JournalEntry[];
  campsCleared: string[];
};

export type Settings = {
  sound: boolean;
  highContrast: boolean;
};

export type StoreData = {
  version: 1;
  parentPin: string | null;
  children: Child[];
  activeChildId: string | null;
  settings: Settings;
};

export const OPERATIONS: Operation[] = ["add", "sub", "mul", "div"];

export const MAX_PROFILES = 3;

export const KIND_WINDOW_MS = 12000;

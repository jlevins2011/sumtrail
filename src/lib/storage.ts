import type { Child, JournalEntry, LessonRecord, Session, Settings, StoreData } from "../types";
import { OPERATIONS } from "../types";

export const STORE_KEY = "sumtrail.v1";

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  highContrast: false,
};

export function emptyOperationTally(): Record<(typeof OPERATIONS)[number], number> {
  return { add: 0, sub: 0, mul: 0, div: 0 };
}

export function emptyStore(): StoreData {
  return {
    version: 1,
    parentPin: null,
    children: [],
    activeChildId: null,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StoreData;
    if (parsed.version !== 1 || !Array.isArray(parsed.children)) return emptyStore();
    return {
      ...emptyStore(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      children: parsed.children.map(normalizeChild),
    };
  } catch {
    return emptyStore();
  }
}

function normalizeChild(child: Child): Child {
  return {
    ...child,
    factsFound: child.factsFound ?? [],
    journal: child.journal ?? [],
    campsCleared: child.campsCleared ?? [],
    sessions: child.sessions ?? [],
    completedLessons: child.completedLessons ?? {},
  };
}

export function saveStore(data: StoreData): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function hashPin(pin: string): string {
  let h = 5381;
  const salted = `sumtrail:${pin}`;
  for (let i = 0; i < salted.length; i++) {
    h = (h * 33) ^ salted.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createChild(name: string, coat: Child["coat"]): Child {
  return {
    id: newId(),
    name: name.trim() || "Explorer",
    coat,
    createdAt: Date.now(),
    completedLessons: {},
    sessions: [],
    factsFound: [],
    journal: [],
    campsCleared: [],
  };
}

export function mergeLessonRecord(
  current: LessonRecord | undefined,
  next: Pick<LessonRecord, "stars" | "bestAccuracy">,
): LessonRecord {
  return {
    stars: Math.max(current?.stars ?? 0, next.stars),
    bestAccuracy: Math.max(current?.bestAccuracy ?? 0, next.bestAccuracy),
    attempts: (current?.attempts ?? 0) + 1,
    completedAt: Date.now(),
  };
}

export function appendSession(child: Child, session: Session, extras: JournalEntry[] = []): Child {
  const journal = [...child.journal];
  for (const entry of extras) {
    if (!journal.some((item) => item.id === entry.id)) journal.push(entry);
  }
  return {
    ...child,
    sessions: [...child.sessions, session].slice(-200),
    factsFound: [...new Set([...child.factsFound, ...session.factsFound])],
    journal: journal.slice(-120),
  };
}

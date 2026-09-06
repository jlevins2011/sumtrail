import { LESSONS, lessonsInWorld, previousLessonId } from "../data/curriculum";
import { DEMO_WORLD_ID, isWorldPlayable } from "./demo";
import { childStartWorldId, getWorldOrder } from "./startLevel";
import type { Child, Operation, Session } from "../types";
import { OPERATIONS } from "../types";

export function isLessonUnlocked(child: Child, lessonId: string, demo = false): boolean {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  if (!lesson) return false;
  if (!isWorldPlayable(lesson.worldId, demo)) return false;

  if (!demo) {
    const startWorld = childStartWorldId(child);
    const worldIndex = getWorldOrder(lesson.worldId);
    const startIndex = getWorldOrder(startWorld);
    if (worldIndex >= 0 && startIndex >= 0 && worldIndex < startIndex) return true;
    if (worldIndex === startIndex && lessonsInWorld(lesson.worldId)[0]?.id === lesson.id) return true;
  }

  if (lesson.number === 1) return true;
  const prev = previousLessonId(lessonId);
  if (!prev) return true;
  const prevLesson = LESSONS.find((item) => item.id === prev);
  if (prevLesson && !isWorldPlayable(prevLesson.worldId, demo) && demo) {
    return lesson.worldId === prevLesson.worldId;
  }
  return (child.completedLessons[prev]?.stars ?? 0) >= 1;
}

export function recommendedLessonId(child: Child, demo = false): string {
  const playable = LESSONS.filter((lesson) => isWorldPlayable(lesson.worldId, demo));
  const startWorld = demo ? DEMO_WORLD_ID : childStartWorldId(child);
  const startIndex = playable.findIndex((lesson) => lesson.worldId === startWorld);
  const fromStart = startIndex >= 0 ? playable.slice(startIndex) : playable;
  for (const lesson of fromStart) {
    const record = child.completedLessons[lesson.id];
    if (!record || record.stars < 1) return lesson.id;
  }
  return fromStart[fromStart.length - 1]?.id ?? playable[playable.length - 1]?.id ?? LESSONS[0].id;
}

export function progressPercent(child: Child, demo = false): number {
  const playable = LESSONS.filter((lesson) => isWorldPlayable(lesson.worldId, demo));
  const done = playable.filter((lesson) => (child.completedLessons[lesson.id]?.stars ?? 0) >= 1).length;
  return playable.length ? Math.round((done / playable.length) * 100) : 0;
}

export function totalStars(child: Child): number {
  return Object.values(child.completedLessons).reduce((sum, rec) => sum + rec.stars, 0);
}

export function maxStars(demo = false): number {
  return LESSONS.filter((lesson) => isWorldPlayable(lesson.worldId, demo)).length * 3;
}

export function practiceMs(sessions: Session[], since?: number): number {
  return sessions
    .filter((session) => (since ? session.startedAt >= since : true))
    .reduce((sum, session) => sum + session.durationMs, 0);
}

export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) {
    const secs = Math.round(ms / 1000);
    return `${secs}s`;
  }
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return `${hours}h ${mins}m`;
}

export function startOfDay(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfWeek(now = Date.now()): number {
  const d = new Date(now);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function recentSessions(child: Child, limit = 12): Session[] {
  return [...child.sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, limit);
}

export function practiceStreak(sessions: Session[], now = Date.now()): number {
  const days = new Set(sessions.map((session) => startOfDay(session.startedAt)));
  const cursor = new Date(startOfDay(now));
  if (!days.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.getTime())) return 0;
  }
  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function accuracyByOperation(child: Child): Record<Operation, { correct: number; errors: number; accuracy: number }> {
  const next = Object.fromEntries(
    OPERATIONS.map((op) => [op, { correct: 0, errors: 0, accuracy: 0 }]),
  ) as Record<Operation, { correct: number; errors: number; accuracy: number }>;
  for (const session of child.sessions) {
    for (const op of OPERATIONS) {
      next[op].correct += session.operationCorrect[op] ?? 0;
      next[op].errors += session.operationErrors[op] ?? 0;
    }
  }
  for (const op of OPERATIONS) {
    const total = next[op].correct + next[op].errors;
    next[op].accuracy = total ? Math.round((next[op].correct / total) * 100) : 0;
  }
  return next;
}

export function uniqueFactsPracticed(child: Child): number {
  const ids = new Set<string>();
  for (const session of child.sessions) {
    for (const id of Object.keys(session.factErrors)) ids.add(id);
    for (const id of session.factsFound) ids.add(id);
  }
  for (const id of child.factsFound) ids.add(id);
  return ids.size;
}

export function weakFacts(child: Child, limit = 6): { key: string; misses: number }[] {
  const tally: Record<string, number> = {};
  for (const session of child.sessions) {
    for (const [key, n] of Object.entries(session.factErrors)) {
      tally[key] = (tally[key] ?? 0) + n;
    }
  }
  return Object.entries(tally)
    .map(([key, misses]) => ({ key, misses }))
    .sort((a, b) => b.misses - a.misses)
    .slice(0, limit);
}

export function isNightSumKeeper(child: Child): boolean {
  const exam = child.completedLessons["summit-exam"];
  return (exam?.stars ?? 0) >= 1 && (exam?.bestAccuracy ?? 0) >= 85;
}

export { nextLessonId } from "../data/curriculum";

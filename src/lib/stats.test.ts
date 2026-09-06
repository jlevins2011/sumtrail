import { describe, expect, it } from "vitest";
import { LESSONS } from "../data/curriculum";
import { createChild, emptyOperationTally } from "./storage";
import {
  accuracyByOperation,
  isLessonUnlocked,
  practiceStreak,
  progressPercent,
  recommendedLessonId,
  uniqueFactsPracticed,
} from "./stats";
import type { Session } from "../types";

function session(partial: Partial<Session>): Session {
  return {
    id: "s",
    childId: "c",
    lessonId: "ember-meet",
    startedAt: Date.now(),
    durationMs: 40000,
    accuracy: 100,
    errors: 0,
    correct: 6,
    factErrors: {},
    operationCorrect: { ...emptyOperationTally(), add: 6 },
    operationErrors: emptyOperationTally(),
    stars: 3,
    passed: true,
    factsFound: ["add-2-2"],
    smoothness: 0.8,
    ...partial,
  };
}

describe("stats", () => {
  it("unlocks Ember Grove in order and keeps later camps locked in demo", () => {
    const child = createChild("Ada", "ember");
    expect(isLessonUnlocked(child, "ember-meet", true)).toBe(true);
    expect(isLessonUnlocked(child, "ember-add", true)).toBe(false);
    child.completedLessons["ember-meet"] = { stars: 1, bestAccuracy: 80, attempts: 1, completedAt: 1 };
    expect(isLessonUnlocked(child, "ember-add", true)).toBe(true);
    expect(isLessonUnlocked(child, "pine-ten", true)).toBe(false);
    expect(isLessonUnlocked(child, "pine-ten", false)).toBe(false);
  });

  it("opens every camp at or below a chosen start, and keeps later camps sequential", () => {
    const child = createChild("Drew", "dusk", "3");
    expect(isLessonUnlocked(child, "ember-meet", false)).toBe(true);
    expect(isLessonUnlocked(child, "ember-clear", false)).toBe(true);
    expect(isLessonUnlocked(child, "pine-ten", false)).toBe(true);
    expect(isLessonUnlocked(child, "meadow-easy", false)).toBe(true);
    expect(isLessonUnlocked(child, "meadow-clear", false)).toBe(false);
    expect(isLessonUnlocked(child, "hollow-easy", false)).toBe(false);
    expect(recommendedLessonId(child, false)).toBe("meadow-easy");
  });

  it("opens Night Sum for Grade 5+ while demo still stays in Ember Grove", () => {
    const child = createChild("Eli", "moss", "5+");
    expect(isLessonUnlocked(child, "summit-warm", false)).toBe(true);
    expect(isLessonUnlocked(child, "hollow-easy", false)).toBe(true);
    expect(recommendedLessonId(child, false)).toBe("summit-warm");
    expect(isLessonUnlocked(child, "pine-ten", true)).toBe(false);
    expect(isLessonUnlocked(child, "ember-meet", true)).toBe(true);
    expect(recommendedLessonId(child, true)).toBe("ember-meet");
  });

  it("finishing Ember Grove is 100% in demo and unlocks Pine Bridge in full play", () => {
    const child = createChild("Bea", "snow");
    for (const lesson of LESSONS.filter((item) => item.worldId === "ember-grove")) {
      child.completedLessons[lesson.id] = { stars: 2, bestAccuracy: 90, attempts: 1, completedAt: 1 };
    }
    expect(progressPercent(child, true)).toBe(100);
    expect(isLessonUnlocked(child, "pine-ten", false)).toBe(true);
    expect(isLessonUnlocked(child, "pine-ten", true)).toBe(false);
    expect(recommendedLessonId(child, true)).toBe("ember-clear");
  });

  it("counts a practice streak across calendar days", () => {
    const day = 24 * 60 * 60 * 1000;
    const now = new Date("2026-09-05T15:00:00").getTime();
    const sessions = [
      session({ startedAt: now }),
      session({ startedAt: now - day, id: "y" }),
      session({ startedAt: now - 2 * day, id: "d" }),
    ];
    expect(practiceStreak(sessions, now)).toBe(3);
    expect(practiceStreak([session({ startedAt: now - 3 * day })], now)).toBe(0);
  });

  it("rolls accuracy by operation and unique facts", () => {
    const child = createChild("Cal", "moss");
    child.sessions = [
      session({
        operationCorrect: { add: 5, sub: 2, mul: 0, div: 0 },
        operationErrors: { add: 1, sub: 0, mul: 0, div: 0 },
        factsFound: ["add-1-2", "sub-5-1"],
        factErrors: { "add-4-3": 1 },
      }),
    ];
    child.factsFound = ["add-1-2", "sub-5-1"];
    const ops = accuracyByOperation(child);
    expect(ops.add.accuracy).toBe(83);
    expect(ops.sub.accuracy).toBe(100);
    expect(uniqueFactsPracticed(child)).toBe(3);
  });
});

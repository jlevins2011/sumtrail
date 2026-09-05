import { describe, expect, it } from "vitest";
import { getLesson } from "../data/curriculum";
import { accuracyOf, answersMatch, evaluateRound, smoothnessScore, starsFor } from "./engine";

describe("engine", () => {
  it("scores accuracy and kind stars", () => {
    expect(accuracyOf(8, 2)).toBe(80);
    expect(starsFor(95, true, 0.8)).toBe(3);
    expect(starsFor(85, true, 0.2)).toBe(2);
    expect(starsFor(76, true, 0.1)).toBe(1);
    expect(starsFor(90, false, 1)).toBe(0);
  });

  it("treats late answers as less smooth, never negative", () => {
    expect(smoothnessScore([1500, 1800])).toBeGreaterThan(0.9);
    expect(smoothnessScore([20000])).toBe(0);
  });

  it("passes Ember Grove campfire at 75%", () => {
    const lesson = getLesson("ember-clear");
    expect(lesson).toBeTruthy();
    const result = evaluateRound(lesson!, 6, 2, [3000, 3200, 2800, 4000, 3500, 3000]);
    expect(result.accuracy).toBe(75);
    expect(result.passed).toBe(true);
    expect(result.stars).toBeGreaterThanOrEqual(1);
  });

  it("holds the Night Sum gate at 85%", () => {
    const lesson = getLesson("summit-exam");
    const fail = evaluateRound(lesson!, 13, 3, [4000]);
    const pass = evaluateRound(lesson!, 14, 2, [4000]);
    expect(fail.accuracy).toBe(81);
    expect(fail.passed).toBe(false);
    expect(pass.accuracy).toBe(88);
    expect(pass.passed).toBe(true);
  });

  it("does not trap on a typed miss — match is exact, not fuzzy", () => {
    expect(answersMatch("8", 8)).toBe(true);
    expect(answersMatch("08", 8)).toBe(true);
    expect(answersMatch("7", 8)).toBe(false);
    expect(answersMatch("", 8)).toBe(false);
  });
});

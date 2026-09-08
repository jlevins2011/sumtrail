import { thinkingWindowMs } from "./pacing";
import type { Lesson } from "../types";

export function accuracyOf(correct: number, errors: number): number {
  const total = correct + errors;
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/** 1 = snappy, 0 = unhurried. Kind — never used to fail a kid. */
export function smoothnessScore(responseMs: number[], kindMs = 8000): number {
  if (!responseMs.length) return 0;
  const avg = responseMs.reduce((sum, ms) => sum + ms, 0) / responseMs.length;
  const span = kindMs * 1.5;
  return Math.max(0, Math.min(1, 1 - (avg - 2000) / span));
}

export function starsFor(accuracy: number, passed: boolean, smoothness: number): number {
  if (!passed) return 0;
  if (accuracy >= 92 && smoothness >= 0.4) return 3;
  if (accuracy >= 84 || smoothness >= 0.65) return 2;
  return 1;
}

export function evaluateRound(
  lesson: Lesson,
  correct: number,
  errors: number,
  responseMs: number[],
): { accuracy: number; stars: number; passed: boolean; smoothness: number } {
  const accuracy = accuracyOf(correct, errors);
  const smoothness = smoothnessScore(responseMs, thinkingWindowMs(lesson));
  const finished = correct + errors >= lesson.questionCount;
  const passed = finished && accuracy >= lesson.goals.accuracy;
  return {
    accuracy,
    smoothness,
    passed,
    stars: starsFor(accuracy, passed, smoothness),
  };
}

export function parseAnswer(raw: string): number | null {
  if (!raw.length) return null;
  if (!/^\d+$/.test(raw)) return null;
  return Number(raw);
}

export function answersMatch(typed: string, answer: number): boolean {
  const value = parseAnswer(typed);
  return value !== null && value === answer;
}

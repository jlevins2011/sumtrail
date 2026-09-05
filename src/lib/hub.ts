/**
 * Foxtrail Family hub hook (stub only).
 *
 * A future hub at foxtrail-family can:
 *  - unlock camps beyond a `?demo=1` first-camp slice
 *  - inject shared math-fact question banks so siblings stay in sync
 *
 * Sumtrail plays with its local curriculum and localStorage even when
 * the hub is missing. Do not import the hub at runtime.
 */
import type { Fact, Operation } from "../types";

/** Shared fact row a hub question bank could supply later. */
export type HubFactSeed = {
  a: number;
  b: number;
  op: Operation;
  answer: number;
};

export type HubQuestionBank = {
  id: string;
  title: string;
  facts: HubFactSeed[];
};

export type HubUnlockHint = {
  /** Camp / world ids the hub would unlock for this household. */
  camps: string[];
  /** When true, the hub still wants the first-camp demo slice. */
  demo?: boolean;
};

export type HubProgressBridge = {
  /** Reserved for a future signed household token — unused in v1. */
  householdId?: string;
  banks?: HubQuestionBank[];
  unlock?: HubUnlockHint;
};

/** Identity helper so unused stub types stay referenced in tests. */
export function emptyHubBridge(): HubProgressBridge {
  return {};
}

/** Hub seeds would map onto local Fact prompts later. */
export function hubSeedToFactHint(seed: HubFactSeed): Pick<Fact, "a" | "b" | "op" | "answer"> {
  return { a: seed.a, b: seed.b, op: seed.op, answer: seed.answer };
}

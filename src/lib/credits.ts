import { getWorld } from "../data/curriculum";
import { newId } from "./storage";

/**
 * Cross-game economy namespace. Lumen Isles will later spend these credits.
 * Sumtrail only writes earn events. Do not change sibling repos from here.
 */
export const FOXTRAIL_CREDITS_KEY = "foxtrail.credits.v1";

export type FoxtrailCreditSource = "sumtrail";

export type FoxtrailCreditEvent = {
  id: string;
  amount: number;
  source: FoxtrailCreditSource;
  campId: string;
  childId: string;
  at: number;
};

export type FoxtrailCreditsV1 = {
  version: 1;
  events: FoxtrailCreditEvent[];
};

export function emptyCredits(): FoxtrailCreditsV1 {
  return { version: 1, events: [] };
}

export function loadCredits(): FoxtrailCreditsV1 {
  try {
    const raw = localStorage.getItem(FOXTRAIL_CREDITS_KEY);
    if (!raw) return emptyCredits();
    const parsed = JSON.parse(raw) as FoxtrailCreditsV1;
    if (parsed.version !== 1 || !Array.isArray(parsed.events)) return emptyCredits();
    return { version: 1, events: parsed.events };
  } catch {
    return emptyCredits();
  }
}

export function saveCredits(data: FoxtrailCreditsV1): void {
  localStorage.setItem(FOXTRAIL_CREDITS_KEY, JSON.stringify(data));
}

export function creditBalance(data: FoxtrailCreditsV1 = loadCredits(), childId?: string): number {
  return data.events
    .filter((event) => (childId ? event.childId === childId : true))
    .reduce((sum, event) => sum + event.amount, 0);
}

export function alreadyEarnedCamp(childId: string, campId: string, data = loadCredits()): boolean {
  return data.events.some((event) => event.childId === childId && event.campId === campId && event.source === "sumtrail");
}

export function earnCampCredits(childId: string, campId: string, at = Date.now()): FoxtrailCreditEvent | null {
  const world = getWorld(campId);
  if (!world) return null;
  const current = loadCredits();
  if (alreadyEarnedCamp(childId, campId, current)) return null;
  const event: FoxtrailCreditEvent = {
    id: newId(),
    amount: world.creditAmount,
    source: "sumtrail",
    campId,
    childId,
    at,
  };
  saveCredits({ version: 1, events: [...current.events, event] });
  return event;
}

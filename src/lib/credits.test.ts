import { afterEach, describe, expect, it } from "vitest";
import {
  alreadyEarnedCamp,
  creditBalance,
  earnCampCredits,
  FOXTRAIL_CREDITS_KEY,
  loadCredits,
} from "./credits";

afterEach(() => {
  localStorage.removeItem(FOXTRAIL_CREDITS_KEY);
});

describe("foxtrail.credits.v1", () => {
  it("emits a sumtrail earn event when Ember Grove is first cleared", () => {
    const event = earnCampCredits("kid-1", "ember-grove", 1000);
    expect(event).toMatchObject({
      amount: 15,
      source: "sumtrail",
      campId: "ember-grove",
      childId: "kid-1",
    });
    const stored = loadCredits();
    expect(stored.version).toBe(1);
    expect(stored.events).toHaveLength(1);
    expect(creditBalance(stored)).toBe(15);
    expect(alreadyEarnedCamp("kid-1", "ember-grove", stored)).toBe(true);
  });

  it("does not double-pay the same child and camp", () => {
    earnCampCredits("kid-1", "ember-grove");
    expect(earnCampCredits("kid-1", "ember-grove")).toBeNull();
    expect(loadCredits().events).toHaveLength(1);
    earnCampCredits("kid-2", "ember-grove");
    expect(creditBalance()).toBe(30);
  });

  it("uses documented amounts for later camps", () => {
    expect(earnCampCredits("k", "pine-bridge")?.amount).toBe(20);
    expect(earnCampCredits("k", "multiplying-meadow")?.amount).toBe(25);
    expect(earnCampCredits("k", "night-sum")?.amount).toBe(40);
  });
});

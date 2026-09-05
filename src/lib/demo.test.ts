import { describe, expect, it } from "vitest";
import { DEMO_WORLD_ID, isDemoMode, isWorldPlayable, visibleWorlds } from "./demo";

describe("demo mode", () => {
  it("reads ?demo=1 and hides later camps", () => {
    expect(isDemoMode("?demo=1")).toBe(true);
    expect(isDemoMode("")).toBe(false);
    const worlds = visibleWorlds(true);
    expect(worlds).toHaveLength(1);
    expect(worlds[0].id).toBe(DEMO_WORLD_ID);
    expect(isWorldPlayable("ember-grove", true)).toBe(true);
    expect(isWorldPlayable("pine-bridge", true)).toBe(false);
    expect(visibleWorlds(false).length).toBeGreaterThan(1);
  });
});

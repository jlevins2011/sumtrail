import { describe, expect, it } from "vitest";
import { createChild } from "./storage";
import {
  childStartWorldId,
  describeStartLevel,
  hasChosenStartLevel,
  isWorldAtOrBelowStart,
  resolveStartLevel,
  startLevelFor,
} from "./startLevel";

describe("start level", () => {
  it("maps grade bands onto camps", () => {
    expect(startLevelFor("k-1").campId).toBe("ember-grove");
    expect(startLevelFor("2").campId).toBe("pine-bridge");
    expect(startLevelFor("3").campId).toBe("multiplying-meadow");
    expect(startLevelFor("4").campId).toBe("division-hollow");
    expect(startLevelFor("5+").campId).toBe("night-sum");
  });

  it("unlocks every camp at or below the start", () => {
    expect(isWorldAtOrBelowStart("ember-grove", "multiplying-meadow")).toBe(true);
    expect(isWorldAtOrBelowStart("multiplying-meadow", "multiplying-meadow")).toBe(true);
    expect(isWorldAtOrBelowStart("division-hollow", "multiplying-meadow")).toBe(false);
  });

  it("describes a profile’s chosen start", () => {
    const child = createChild("Nia", "dusk", "3");
    expect(hasChosenStartLevel(child)).toBe(true);
    expect(childStartWorldId(child)).toBe("multiplying-meadow");
    expect(describeStartLevel(child)).toBe("Grade 3 · Multiplying Meadow");
    expect(resolveStartLevel({}).campId).toBe("ember-grove");
  });
});

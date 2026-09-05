import { describe, expect, it } from "vitest";
import { campClearLesson, LESSONS, nextLessonId, WORLDS } from "../data/curriculum";

describe("curriculum", () => {
  it("has the five named camps and Ember Grove is first", () => {
    expect(WORLDS.map((w) => w.id)).toEqual([
      "ember-grove",
      "pine-bridge",
      "multiplying-meadow",
      "division-hollow",
      "night-sum",
    ]);
    expect(LESSONS[0].id).toBe("ember-meet");
    expect(LESSONS[0].worldId).toBe("ember-grove");
    expect(campClearLesson("ember-grove")?.id).toBe("ember-clear");
  });

  it("walks Ember Grove then Pine Bridge", () => {
    expect(nextLessonId("ember-meet")).toBe("ember-add");
    expect(nextLessonId("ember-clear")).toBe("pine-ten");
  });

  it("opens multiplying meadow with 2, 5, 10", () => {
    const first = LESSONS.find((lesson) => lesson.worldId === "multiplying-meadow");
    expect(first?.bank.mulFactors).toEqual([2, 5, 10]);
  });
});

import { describe, expect, it } from "vitest";
import { emptyHubBridge, hubSeedToFactHint } from "./hub";

describe("foxtrail family hub stub", () => {
  it("stays unused so Sumtrail plays without the hub", () => {
    expect(emptyHubBridge()).toEqual({});
    expect(hubSeedToFactHint({ a: 3, b: 4, op: "add", answer: 7 })).toEqual({
      a: 3,
      b: 4,
      op: "add",
      answer: 7,
    });
  });
});

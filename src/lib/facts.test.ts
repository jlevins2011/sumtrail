import { describe, expect, it } from "vitest";
import { buildRound, candidatesFor, makeFact } from "./facts";

function seed(n: number): () => number {
  return () => {
    n = (n * 16807) % 2147483647;
    return n / 2147483647;
  };
}

describe("facts", () => {
  it("adds within 10 stay in bounds", () => {
    const pool = candidatesFor({ operations: ["add"], addMax: 10, addendMax: 10 });
    expect(pool.length).toBeGreaterThan(10);
    for (const fact of pool) {
      expect(fact.op).toBe("add");
      expect(fact.a + fact.b).toBeLessThanOrEqual(10);
      expect(fact.answer).toBe(fact.a + fact.b);
    }
  });

  it("subtracts within 10 never go negative", () => {
    const pool = candidatesFor({ operations: ["sub"], addMax: 10, addendMax: 10 });
    for (const fact of pool) {
      expect(fact.a).toBeGreaterThanOrEqual(fact.b);
      expect(fact.answer).toBe(fact.a - fact.b);
      expect(fact.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it("starts multiplying meadow with 2, 5, 10", () => {
    const pool = candidatesFor({ operations: ["mul"], mulFactors: [2, 5, 10] });
    for (const fact of pool) {
      expect([fact.a, fact.b].some((n) => [2, 5, 10].includes(n))).toBe(true);
      expect(fact.answer).toBe(fact.a * fact.b);
    }
  });

  it("division facts are exact related facts", () => {
    const pool = candidatesFor({ operations: ["div"], divDivisors: [2, 5, 10] });
    expect(pool.every((fact) => fact.b !== 0 && fact.a % fact.b === 0)).toBe(true);
    expect(pool.some((fact) => fact.prompt === "15 ÷ 5")).toBe(true);
  });

  it("builds a non-empty ember grove round", () => {
    const round = buildRound({ operations: ["add", "sub"], addMax: 10, addendMax: 10 }, 8, seed(3));
    expect(round).toHaveLength(8);
    expect(new Set(round.map((f) => f.id)).size).toBeGreaterThan(1);
  });

  it("writes a number-sense tip", () => {
    expect(makeFact("add", 7, 3).tip).toMatch(/friendly ten/i);
    expect(makeFact("mul", 5, 4).tip).toMatch(/fives/i);
    expect(makeFact("div", 20, 5).tip).toMatch(/5s fit in 20/i);
  });
});

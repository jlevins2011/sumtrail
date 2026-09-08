import type { Fact, FactBank, Operation } from "../types";

const OP_SYMBOL: Record<Operation, string> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

export function shuffle<T>(items: T[], rand: () => number = Math.random): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function factId(op: Operation, a: number, b: number): string {
  return `${op}-${a}-${b}`;
}

export function applyOp(op: Operation, a: number, b: number): number {
  switch (op) {
    case "add":
      return a + b;
    case "sub":
      return a - b;
    case "mul":
      return a * b;
    case "div":
      return b === 0 ? 0 : a / b;
  }
}

export function tipFor(op: Operation, a: number, b: number, answer: number): string {
  if (op === "add") {
    if (a === 0) return `Zero plus ${b} stays ${b}.`;
    if (b === 0) return `${a} plus zero stays ${a}.`;
    if (a === b) return `Doubles are lantern twins: ${a} + ${a} = ${answer}.`;
    if (a + b === 10) return `${a} and ${b} make a friendly ten.`;
    if (a + b === 20) return `${a} + ${b} fills a double ten.`;
    const bigger = Math.max(a, b);
    const smaller = Math.min(a, b);
    return `Count on from ${bigger}: ${smaller} hop${smaller === 1 ? "" : "s"} lands on ${answer}.`;
  }
  if (op === "sub") {
    if (b === 0) return `Take away zero and the pile stays ${a}.`;
    if (a === b) return `Take away the whole pile and you have zero.`;
    return `Think of the matching add: ${b} + ${answer} = ${a}, so ${a} − ${b} = ${answer}.`;
  }
  if (op === "mul") {
    if (a === 0 || b === 0) return `Zero groups — or groups of zero — leave an empty pouch.`;
    if (a === 1) return `One group of ${b} is still ${b}.`;
    if (b === 1) return `${a} groups of one is ${a}.`;
    if (a === 10 || b === 10) return `Times 10 adds a zero lantern: ${a} × ${b} = ${answer}.`;
    if (a === 5 || b === 5) return `Fives skip-count: ${a} × ${b} = ${answer}.`;
    if (a === 2 || b === 2) return `Times 2 is a double: ${answer}.`;
    return `${a} groups of ${b} make ${answer}. Flip the factors if that order is friendlier.`;
  }
  if (b === 1) return `${a} shared one way is still ${a}.`;
  if (answer === 0) return `Zero shared any number of ways is still zero.`;
  return `How many ${b}s fit in ${a}? ${answer} — because ${b} × ${answer} = ${a}.`;
}

export function makeFact(op: Operation, a: number, b: number): Fact {
  const answer = applyOp(op, a, b);
  return {
    id: factId(op, a, b),
    a,
    b,
    op,
    answer,
    prompt: `${a} ${OP_SYMBOL[op]} ${b}`,
    tip: tipFor(op, a, b, answer),
  };
}

export function candidatesFor(bank: FactBank): Fact[] {
  const facts: Fact[] = [];
  const seen = new Set<string>();

  const push = (op: Operation, a: number, b: number) => {
    if (op === "div" && (b === 0 || a % b !== 0)) return;
    if (op === "sub" && a < b) return;
    const fact = makeFact(op, a, b);
    if (seen.has(fact.id)) return;
    seen.add(fact.id);
    facts.push(fact);
  };

  for (const op of bank.operations) {
    if (op === "add" || op === "sub") {
      const max = bank.addMax ?? 10;
      const addendMax = bank.addendMax ?? max;
      for (let a = 0; a <= max; a++) {
        for (let b = 0; b <= addendMax; b++) {
          if (op === "add" && a + b > max) continue;
          if (op === "sub" && a > max) continue;
          push(op, a, b);
        }
      }
    }
    if (op === "mul") {
      const factors = bank.mulFactors ?? [2, 5, 10];
      for (const factor of factors) {
        for (let other = 0; other <= 12; other++) {
          push(op, factor, other);
          if (factor !== other) push(op, other, factor);
        }
      }
    }
    if (op === "div") {
      const divisors = bank.divDivisors ?? [2, 5, 10];
      for (const divisor of divisors) {
        if (divisor === 0) continue;
        for (let quotient = 0; quotient <= 12; quotient++) {
          push(op, divisor * quotient, divisor);
        }
      }
    }
  }

  return facts;
}

export function isCorePractice(f: Fact): boolean {
  return f.a > 0 && f.b > 0 && (f.op === 'add' || f.op === 'sub' && f.answer > 0 || f.op === 'mul' && f.a > 1 && f.b > 1 || f.op === 'div' && f.b > 1 && f.answer > 1);
}

export function buildRound(bank: FactBank, count: number, rand: () => number = Math.random): Fact[] {
  const pool = candidatesFor(bank);
  if (pool.length === 0) return [];
  const picked: Fact[] = [];
  while (picked.length < count) {
    const core = shuffle(pool.filter(isCorePractice), rand);
    const identities = shuffle(pool.filter(f => !isCorePractice(f)), rand);
    // Dedicated zero/one banks are lessons in their own right. Otherwise give
    // meaningful work first and reserve at most one slot in eight for identities.
    const remaining = count - picked.length;
    const identitySlots = Math.floor(count / 8);
    const batch = core.length ? [...core.slice(0, Math.max(remaining - identitySlots, 1)), ...identities.slice(0, identitySlots)] : identities;
    for (const fact of batch) {
      if (picked.length >= count) break;
      const last = picked[picked.length - 1];
      if (last && last.id === fact.id) continue;
      picked.push(fact);
    }
    if (pool.length === 1) {
      while (picked.length < count) picked.push(pool[0]);
    }
  }
  return picked;
}

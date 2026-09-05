import type { Lesson, World } from "../types";

export const WORLDS: World[] = [
  {
    id: "ember-grove",
    name: "Ember Grove",
    subtitle: "Add and subtract within 10 — first lanterns",
    mood: "dawn",
    creditAmount: 15,
  },
  {
    id: "pine-bridge",
    name: "Pine Bridge",
    subtitle: "Add and subtract within 20",
    mood: "day",
    creditAmount: 20,
  },
  {
    id: "multiplying-meadow",
    name: "Multiplying Meadow",
    subtitle: "Times tables 0–12, starting with 2, 5, and 10",
    mood: "fire",
    creditAmount: 25,
  },
  {
    id: "division-hollow",
    name: "Division Hollow",
    subtitle: "Sharing facts that match the tables",
    mood: "dusk",
    creditAmount: 25,
  },
  {
    id: "night-sum",
    name: "Night Sum Summit",
    subtitle: "Mixed fluency — the 85% proficiency gate",
    mood: "night",
    creditAmount: 40,
  },
];

type Draft = Omit<Lesson, "number">;

const RAW: Draft[] = [
  {
    id: "ember-meet",
    worldId: "ember-grove",
    title: "Meet Ember Grove",
    tease: "Tiny adds by the first lanterns",
    kind: "guide",
    bank: { operations: ["add"], addMax: 5, addendMax: 5 },
    questionCount: 6,
    goals: { accuracy: 60 },
    intro:
      "Pip the lantern fox packs a pouch of number stones. In Ember Grove we add little piles — nothing bigger than 5. Tap the answer, light a lantern, and keep walking.",
    tip: "Count on from the bigger number. 4 + 1 is just one hop past 4.",
  },
  {
    id: "ember-add",
    worldId: "ember-grove",
    title: "Friendly tens",
    tease: "Add within 10",
    kind: "drill",
    bank: { operations: ["add"], addMax: 10, addendMax: 10 },
    questionCount: 8,
    goals: { accuracy: 70 },
    intro: "The grove path likes numbers that make 10. 7 + 3, 6 + 4, 5 + 5 — those pairs glow extra bright.",
    tip: "If you see 8 + 2, picture a ten-frame filling up.",
  },
  {
    id: "ember-sub",
    worldId: "ember-grove",
    title: "Take-away ferns",
    tease: "Subtract within 10",
    kind: "drill",
    bank: { operations: ["sub"], addMax: 10, addendMax: 10 },
    questionCount: 8,
    goals: { accuracy: 70 },
    intro: "Ferns hide some of Pip’s stones. How many are left? Subtract within 10, then move on — no one gets stuck on a miss.",
    tip: "Think of the add that matches. If 3 + 4 = 7, then 7 − 3 = 4.",
  },
  {
    id: "ember-clear",
    worldId: "ember-grove",
    title: "Grove campfire",
    tease: "Mixed add and subtract to 10",
    kind: "mix",
    bank: { operations: ["add", "sub"], addMax: 10, addendMax: 10 },
    questionCount: 8,
    goals: { accuracy: 75 },
    intro: "The grove campfire needs both adds and take-aways. Light enough lanterns and the next camp opens.",
    tip: "Plus grows the pile. Minus gives stones away.",
    clearsCamp: true,
  },
  {
    id: "pine-ten",
    worldId: "pine-bridge",
    title: "Bridge of tens",
    tease: "Make 10, then hop over",
    kind: "guide",
    bank: { operations: ["add"], addMax: 10, addendMax: 10 },
    questionCount: 8,
    goals: { accuracy: 70 },
    intro: "Pine Bridge is built from tens. Warm up by making 10, then we will cross into the teens.",
    tip: "A friendly ten is a landing stone. 9 + 1, 8 + 2, 7 + 3…",
  },
  {
    id: "pine-add",
    worldId: "pine-bridge",
    title: "Teen crossing",
    tease: "Add within 20",
    kind: "drill",
    bank: { operations: ["add"], addMax: 20, addendMax: 12 },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "Addends stay friendly, but the sum can reach 20. 8 + 7 can become 8 + 2 + 5.",
    tip: "Push one number to 10, then add what is left.",
  },
  {
    id: "pine-sub",
    worldId: "pine-bridge",
    title: "Downstream take-away",
    tease: "Subtract within 20",
    kind: "drill",
    bank: { operations: ["sub"], addMax: 20, addendMax: 12 },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "The river takes stones downstream. Start with a teen and subtract a single-digit or teen helper.",
    tip: "Count back, or think of the matching add.",
  },
  {
    id: "pine-clear",
    worldId: "pine-bridge",
    title: "Bridge campfire",
    tease: "Mixed add and subtract to 20",
    kind: "mix",
    bank: { operations: ["add", "sub"], addMax: 20, addendMax: 12 },
    questionCount: 10,
    goals: { accuracy: 80 },
    intro: "Cross the whole bridge: plus and minus, sums and differences up to 20.",
    tip: "Look at the sign first, then the numbers.",
    clearsCamp: true,
  },
  {
    id: "meadow-easy",
    worldId: "multiplying-meadow",
    title: "Skip-count clover",
    tease: "Times 2, 5, and 10",
    kind: "guide",
    bank: { operations: ["mul"], mulFactors: [2, 5, 10] },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "The meadow starts with the friendliest tables: twos, fives, and tens. Skip-count and the lanterns keep time.",
    tip: "Times 10 adds a zero lantern. Fives land on 0 or 5.",
  },
  {
    id: "meadow-zero-one",
    worldId: "multiplying-meadow",
    title: "Empty and one",
    tease: "Times 0 and 1",
    kind: "drill",
    bank: { operations: ["mul"], mulFactors: [0, 1] },
    questionCount: 8,
    goals: { accuracy: 80 },
    intro: "Zero groups of anything is still an empty pouch. One group keeps the same pile.",
    tip: "× 0 is 0. × 1 stays itself.",
  },
  {
    id: "meadow-mid",
    worldId: "multiplying-meadow",
    title: "Threes and fours",
    tease: "Times 3 and 4",
    kind: "drill",
    bank: { operations: ["mul"], mulFactors: [3, 4] },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "Three hops, four hops. Build the arrays in your head: 3 rows of 4 is the same as 4 rows of 3.",
    tip: "3 × 4 is a tiny window: three across, four down — or the other way.",
  },
  {
    id: "meadow-high",
    worldId: "multiplying-meadow",
    title: "Tall grass tables",
    tease: "Times 6, 7, 8, and 9",
    kind: "drill",
    bank: { operations: ["mul"], mulFactors: [6, 7, 8, 9] },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "The grass grows taller. Use a neighbor you already know: 8 × 5 is 40, so 8 × 6 is one more 8.",
    tip: "9 × n is 10 × n take away n.",
  },
  {
    id: "meadow-teen",
    worldId: "multiplying-meadow",
    title: "Eleven and twelve",
    tease: "Times 11 and 12",
    kind: "drill",
    bank: { operations: ["mul"], mulFactors: [11, 12] },
    questionCount: 8,
    goals: { accuracy: 75 },
    intro: "Eleven doubles the digit (until 9). Twelve is ten groups plus two groups.",
    tip: "12 × 4 = 10 × 4 + 2 × 4.",
  },
  {
    id: "meadow-clear",
    worldId: "multiplying-meadow",
    title: "Meadow campfire",
    tease: "Mixed tables 0–12",
    kind: "mix",
    bank: { operations: ["mul"], mulFactors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    questionCount: 12,
    goals: { accuracy: 80 },
    intro: "The whole meadow at once. Light the mixed tables and the hollow path opens.",
    tip: "Flip the factors if the other order is easier.",
    clearsCamp: true,
  },
  {
    id: "hollow-easy",
    worldId: "division-hollow",
    title: "Fair shares",
    tease: "Divide by 2, 5, and 10",
    kind: "guide",
    bank: { operations: ["div"], divDivisors: [2, 5, 10] },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "Division Hollow is where piles get shared. If you know 2 × 6 = 12, you already know 12 ÷ 2 = 6.",
    tip: "Ask: how many of these fit in the big number?",
  },
  {
    id: "hollow-mid",
    worldId: "division-hollow",
    title: "Related facts",
    tease: "Divide by 3, 4, and 6",
    kind: "drill",
    bank: { operations: ["div"], divDivisors: [3, 4, 6] },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "Every divide has a multiply twin. Keep that twin in your pocket.",
    tip: "24 ÷ 6? Think 6 × ? = 24.",
  },
  {
    id: "hollow-high",
    worldId: "division-hollow",
    title: "Deep hollow",
    tease: "Divide by 7, 8, 9, 11, and 12",
    kind: "drill",
    bank: { operations: ["div"], divDivisors: [7, 8, 9, 11, 12] },
    questionCount: 10,
    goals: { accuracy: 75 },
    intro: "The hollow gets quieter and the facts get taller. Use the table you already lit in the meadow.",
    tip: "If 8 × 7 = 56, then 56 ÷ 8 = 7 and 56 ÷ 7 = 8.",
  },
  {
    id: "hollow-clear",
    worldId: "division-hollow",
    title: "Hollow campfire",
    tease: "Mixed division facts",
    kind: "mix",
    bank: { operations: ["div"], divDivisors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    questionCount: 12,
    goals: { accuracy: 80 },
    intro: "Share the whole pouch. Mixed division facts, then the night climb.",
    tip: "Division is the sharing trail — the multiply path run backward.",
    clearsCamp: true,
  },
  {
    id: "summit-warm",
    worldId: "night-sum",
    title: "Night warm-up",
    tease: "Mixed facts under the stars",
    kind: "mix",
    bank: {
      operations: ["add", "sub", "mul", "div"],
      addMax: 20,
      addendMax: 12,
      mulFactors: [2, 3, 4, 5, 6, 10],
      divDivisors: [2, 4, 5, 10],
    },
    questionCount: 12,
    goals: { accuracy: 80 },
    intro: "The summit path mixes everything: add, subtract, multiply, and divide. Warm up before the proficiency gate.",
    tip: "Read the sign. The numbers wait.",
  },
  {
    id: "summit-exam",
    worldId: "night-sum",
    title: "Night Sum exam",
    tease: "85% mixed fluency",
    kind: "exam",
    bank: {
      operations: ["add", "sub", "mul", "div"],
      addMax: 20,
      addendMax: 12,
      mulFactors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      divDivisors: [2, 3, 4, 5, 6, 10],
    },
    questionCount: 16,
    goals: { accuracy: 85 },
    intro:
      "This is the Night Sum gate. Mixed facts, a kind timer, and an 85% lantern. Misses still show the answer — then the next stone.",
    tip: "Smooth and sure beats rushed. Pip is not keeping a punishing clock.",
    clearsCamp: true,
  },
];

export const LESSONS: Lesson[] = RAW.map((lesson, index) => ({ ...lesson, number: index + 1 }));

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getWorld(id: string): World | undefined {
  return WORLDS.find((world) => world.id === id);
}

export function lessonsInWorld(worldId: string): Lesson[] {
  return LESSONS.filter((lesson) => lesson.worldId === worldId);
}

export function previousLessonId(lessonId: string): string | null {
  const index = LESSONS.findIndex((lesson) => lesson.id === lessonId);
  if (index <= 0) return null;
  return LESSONS[index - 1].id;
}

export function nextLessonId(lessonId: string): string | null {
  const index = LESSONS.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0 || index === LESSONS.length - 1) return null;
  return LESSONS[index + 1].id;
}

export function campClearLesson(worldId: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.worldId === worldId && lesson.clearsCamp);
}

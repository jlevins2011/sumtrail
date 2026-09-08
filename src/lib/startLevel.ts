import { WORLDS } from "../data/curriculum";
import type { Child, GradeBand } from "../types";

export type StartLevel = {
  gradeBand: GradeBand;
  label: string;
  campId: string;
  campName: string;
  blurb: string;
};

export const DEFAULT_GRADE_BAND: GradeBand = "k-1";

export const START_LEVELS: StartLevel[] = [
  {
    gradeBand: "k-1",
    label: "Grade 1 · within 10",
    campId: "ember-grove",
    campName: "Ember Grove",
    blurb: "Add and subtract within 10 — first lanterns",
  },
  {
    gradeBand: "2",
    label: "Grade 2 · within 20",
    campId: "pine-bridge",
    campName: "Pine Bridge",
    blurb: "Add and subtract within 20",
  },
  {
    gradeBand: "3",
    label: "Grade 3 · multiplication",
    campId: "multiplying-meadow",
    campName: "Multiplying Meadow",
    blurb: "Core multiplication facts, with extension tables through 12",
  },
  {
    gradeBand: "4",
    label: "Grade 3 · division",
    campId: "division-hollow",
    campName: "Division Hollow",
    blurb: "Related division facts, with extension tables through 12",
  },
  {
    gradeBand: "5+",
    label: "Mixed fact review · Grade 3 and up",
    campId: "night-sum",
    campName: "Night Sum Summit",
    blurb: "Mixed review — every earlier camp stays open",
  },
];

const GRADE_BANDS = new Set<GradeBand>(START_LEVELS.map((level) => level.gradeBand));

export function isGradeBand(value: unknown): value is GradeBand {
  return typeof value === "string" && GRADE_BANDS.has(value as GradeBand);
}

export function startLevelFor(gradeBand: GradeBand | undefined): StartLevel {
  return START_LEVELS.find((level) => level.gradeBand === gradeBand) ?? START_LEVELS[0];
}

export function startLevelByCamp(campId: string | undefined): StartLevel {
  return START_LEVELS.find((level) => level.campId === campId) ?? START_LEVELS[0];
}

export function hasChosenStartLevel(child: Pick<Child, "gradeBand" | "startWorldId">): boolean {
  return isGradeBand(child.gradeBand) || Boolean(child.startWorldId && getWorldOrder(child.startWorldId) >= 0);
}

export function resolveStartLevel(child: Pick<Child, "gradeBand" | "startWorldId">): StartLevel {
  if (isGradeBand(child.gradeBand)) return startLevelFor(child.gradeBand);
  if (child.startWorldId) return startLevelByCamp(child.startWorldId);
  return startLevelFor(DEFAULT_GRADE_BAND);
}

export function childStartWorldId(child: Pick<Child, "gradeBand" | "startWorldId">): string {
  return resolveStartLevel(child).campId;
}

export function getWorldOrder(worldId: string): number {
  return WORLDS.findIndex((world) => world.id === worldId);
}

/** Camps at or below the chosen start stay playable for review. */
export function isWorldAtOrBelowStart(worldId: string, startWorldId: string): boolean {
  const worldIndex = getWorldOrder(worldId);
  const startIndex = getWorldOrder(startWorldId);
  if (worldIndex < 0 || startIndex < 0) return worldId === startWorldId;
  return worldIndex <= startIndex;
}

export function describeStartLevel(child: Pick<Child, "gradeBand" | "startWorldId">): string {
  const level = resolveStartLevel(child);
  return `${level.label} · ${level.campName}`;
}

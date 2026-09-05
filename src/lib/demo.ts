import { WORLDS } from "../data/curriculum";
import type { World } from "../types";

export const DEMO_WORLD_ID = "ember-grove";

export function isDemoMode(search = typeof window !== "undefined" ? window.location.search : ""): boolean {
  return new URLSearchParams(search).get("demo") === "1";
}

export function visibleWorlds(demo = isDemoMode()): World[] {
  if (!demo) return WORLDS;
  return WORLDS.filter((world) => world.id === DEMO_WORLD_ID);
}

export function isWorldPlayable(worldId: string, demo = isDemoMode()): boolean {
  return !demo || worldId === DEMO_WORLD_ID;
}

import { afterEach, describe, expect, it } from "vitest";
import { createChild, emptyStore, hashPin, loadStore, saveStore, STORE_KEY } from "./storage";

afterEach(() => {
  localStorage.removeItem(STORE_KEY);
});

describe("storage", () => {
  it("hashes parent PINs without storing digits", () => {
    expect(hashPin("1234")).not.toBe("1234");
    expect(hashPin("1234")).toBe(hashPin("1234"));
    expect(hashPin("1234")).not.toBe(hashPin("0000"));
  });

  it("round-trips a child profile", () => {
    const data = emptyStore();
    const child = createChild("Pip’s pal", "dusk");
    data.children.push(child);
    data.activeChildId = child.id;
    saveStore(data);
    const loaded = loadStore();
    expect(loaded.children[0].name).toBe("Pip’s pal");
    expect(loaded.children[0].journal).toEqual([]);
    expect(loaded.children[0].campsCleared).toEqual([]);
  });

  it("recovers from junk localStorage", () => {
    localStorage.setItem(STORE_KEY, "{nope");
    expect(loadStore().children).toEqual([]);
  });
});

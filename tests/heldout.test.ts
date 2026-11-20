import { describe, expect, it } from "vitest";
import { HELDOUT } from "@/data/heldout";
import { SEED } from "@/data/seed";

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
function runs(s: string, n = 6): Set<string> {
  const w = words(s);
  const out = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

describe("held-out set", () => {
  it("has the SPEC 5.4 gold counts", () => {
    const count = (g: string) => HELDOUT.filter((h) => h.gold === g).length;
    expect(HELDOUT).toHaveLength(20);
    expect(count("goal-test-on-generation")).toBe(3);
    expect(count("admissible-means-consistent")).toBe(3);
    expect(count("any-heuristic-optimal")).toBe(3);
    expect(count("g-h-swapped")).toBe(3);
    expect(count("closed-never-reopened")).toBe(2);
    expect(count("bigger-h-always-better")).toBe(2);
    expect(count("abstain")).toBe(4);
  });
  it("shares no 6-word run with any seed text", () => {
    const seedRuns = new Set(SEED.flatMap((s) => [...runs(s.text)]));
    for (const h of HELDOUT) for (const r of runs(h.text)) expect(seedRuns.has(r), `${h.id}: "${r}"`).toBe(false);
  });
});

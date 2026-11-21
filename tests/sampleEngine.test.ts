import { describe, expect, it } from "vitest";
import { SEED } from "@/data/seed";
import { cleanSampleEngine } from "@/engine/sample/classify";


const cases: [string, string][] = [
  ["the goal node got added to the open list so I stopped right there", "goal-test-on-generation"],
  ["I ended the search when I generated the goal instead of waiting to expand it", "goal-test-on-generation"],
  ["I figured if a heuristic is admissible then it must be consistent as well", "admissible-means-consistent"],
  ["consistent and admissible mean the same thing to me honestly", "admissible-means-consistent"],
  ["I believed A* finds the optimal path with any heuristic you give it", "any-heuristic-optimal"],
  ["regardless of h, A* should always return the shortest path, right", "any-heuristic-optimal"],
  ["I swapped g and h when filling in the table", "g-h-swapped"],
  ["I used the parent's heuristic instead of the path cost when computing f", "g-h-swapped"],
  ["I never reopen a node after it goes in the closed set", "closed-never-reopened"],
  ["node D was closed so I ignored the cheaper path to it later", "closed-never-reopened"],
  ["a larger heuristic is always better so I chose the biggest one", "bigger-h-always-better"],
  ["I went with the bigger h values because bigger is better", "bigger-h-always-better"],
];

const vague = [
  "lost on this one",
  "I didn't understand the lecture on this topic at all, help",
  "I thought consistent was the same as admissible so the closed node never gets reopened",
];

describe("Sample engine", () => {
  it.each(cases)("%s → %s", (text, id) => {
    expect(cleanSampleEngine.classify(text).misconceptionId).toBe(id);
  });
  it.each(vague)("abstains on vague or mixed: %s", (text) => {
    const r = cleanSampleEngine.classify(text);
    expect(r.misconceptionId).toBe("abstain");
    expect(r.reason).toBeTruthy();
  });
  it("is deterministic and quotes evidence verbatim", () => {
    for (const s of SEED) {
      const a = cleanSampleEngine.classify(s.text);
      expect(cleanSampleEngine.classify(s.text)).toEqual(a);
      if (a.misconceptionId !== "abstain") expect(s.text.includes(a.evidenceExcerpt)).toBe(true);
    }
  });
  it("reports seed-set agreement (informational)", () => {
    const ok = SEED.filter((s) => cleanSampleEngine.classify(s.text).misconceptionId === s.gold).length;
    console.log(`Sample engine seed-set agreement: ${ok}/${SEED.length}`);
    expect(ok).toBeGreaterThan(0);
  });
});

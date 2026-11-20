import { describe, expect, it } from "vitest";
import { SEED } from "@/data/seed";

const expected: Record<string, Record<string, number>> = {
  "goal-test-on-generation": { Q1: 0, Q2: 5, Q3: 0, Q4: 4, Q5: 5, NS: 0 },
  "admissible-means-consistent": { Q1: 4, Q2: 0, Q3: 5, Q4: 2, Q5: 0, NS: 0 },
  "any-heuristic-optimal": { Q1: 1, Q2: 1, Q3: 0, Q4: 0, Q5: 6, NS: 0 },
  "g-h-swapped": { Q1: 0, Q2: 4, Q3: 2, Q4: 2, Q5: 0, NS: 0 },
  "closed-never-reopened": { Q1: 0, Q2: 1, Q3: 0, Q4: 6, Q5: 0, NS: 0 },
  "bigger-h-always-better": { Q1: 2, Q2: 0, Q3: 0, Q4: 0, Q5: 3, NS: 0 },
  abstain: { Q1: 1, Q2: 0, Q3: 1, Q4: 3, Q5: 0, NS: 2 },
};

describe("seed set", () => {
  it("has 60 items", () => expect(SEED).toHaveLength(60));
  it("matches the SPEC 5.3 table cell by cell", () => {
    for (const [label, row] of Object.entries(expected)) {
      for (const [q, n] of Object.entries(row)) {
        const got = SEED.filter((s) => s.gold === label && s.questionId === q).length;
        expect(got, `${label} × ${q}`).toBe(n);
      }
    }
  });
  it("texts are 10..280 chars, ids and texts unique", () => {
    for (const s of SEED) {
      expect(s.text.length).toBeGreaterThanOrEqual(10);
      expect(s.text.length).toBeLessThanOrEqual(280);
    }
    expect(new Set(SEED.map((s) => s.id)).size).toBe(60);
    expect(new Set(SEED.map((s) => s.text.toLowerCase())).size).toBe(60);
  });
});

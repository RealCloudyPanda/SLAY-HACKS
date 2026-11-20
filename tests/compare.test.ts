import { describe, expect, it } from "vitest";
import { compare, compareSentence } from "@/domain/compare";
import { SEED } from "@/data/seed";

describe("compare on gold seed labels", () => {
  const c = compare(SEED.map((s) => ({ questionId: s.questionId, label: s.gold })));
  it("tells the designed story", () => {
    expect(c.topQuestion).toBe("Q4");
    expect(c.reach.byQuestion).toBe(6);
    expect(c.byMisconception[0].id).toBe("goal-test-on-generation");
    expect(c.reach.byMisconception).toBe(14);
  });
  it("builds the template sentence", () => {
    expect(compareSentence(c, (id) => id)).toBe(
      "Grouping by question says start with Q4. But one explanation of 'goal-test-on-generation' reaches 14 students across Q2, Q4 and Q5, versus 6 for the most common idea inside Q4.",
    );
  });
});

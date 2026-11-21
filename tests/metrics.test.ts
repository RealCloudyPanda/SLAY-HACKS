import { describe, expect, it } from "vitest";
import { byQuestionBaseline, computeMetrics, confusion } from "@/eval/metrics";
import { SEED } from "@/data/seed";

describe("metrics", () => {
  const preds = [
    { gold: "g-h-swapped", predicted: "g-h-swapped" },
    { gold: "g-h-swapped", predicted: "abstain" },
    { gold: "closed-never-reopened", predicted: "g-h-swapped" },
    { gold: "abstain", predicted: "abstain" },
    { gold: "abstain", predicted: "closed-never-reopened" },
  ] as const;
  const m = computeMetrics([...preds]);
  it("computes SPEC 7 metrics on a hand-made confusion", () => {
    expect(m.overallAgreement).toBeCloseTo(2 / 5);
    expect(m.issuedLabelPrecision).toBeCloseTo(1 / 3);
    expect(m.counts.issued).toBe(3);
    expect(m.accuracyWhenAnswered).toBeCloseTo(1 / 2);
    expect(m.coverage).toBeCloseTo(2 / 3);
    expect(m.abstainRate).toBeCloseTo(2 / 5);
    expect(m.ambiguousCaught).toBeCloseTo(1 / 2);
  });
  it("builds a confusion table", () => {
    const c = confusion([...preds]);
    expect(c["g-h-swapped"]["abstain"]).toBe(1);
    expect(c["abstain"]["closed-never-reopened"]).toBe(1);
  });
  it("baseline uses the seed's most common gold per question", () => {
    const b = byQuestionBaseline(SEED);
    expect(b.Q4).toBe("closed-never-reopened");
    expect(b.Q5).toBe("any-heuristic-optimal");
    expect(b.NS).toBe("abstain");
  });
});

it("uses null for unavailable precision and conditional denominators", () => {
  const empty = computeMetrics([]);
  expect(empty.issuedLabelPrecision).toBeNull();
  expect(empty.accuracyWhenAnswered).toBeNull();
  expect(empty.coverage).toBeNull();
  expect(empty.ambiguousCaught).toBeNull();
  const falsePositive = computeMetrics([{ gold: "abstain", predicted: "g-h-swapped" }]);
  expect(falsePositive.issuedLabelPrecision).toBe(0);
  expect(falsePositive.accuracyWhenAnswered).toBeNull();
});

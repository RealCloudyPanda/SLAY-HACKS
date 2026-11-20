import { describe, expect, it } from "vitest";
import { validateResult } from "@/engine/contract";

const text = "I returned the path as soon as the goal showed up in the frontier";
const good = {
  misconceptionId: "goal-test-on-generation",
  evidenceExcerpt: "as soon as the goal showed up in the frontier",
  confidence: 0.8,
  candidates: [{ id: "goal-test-on-generation", score: 0.9 }],
  engine: "live",
};

describe("validateResult", () => {
  it("passes a valid result", () => {
    const r = validateResult(text, good, "live");
    expect(r.misconceptionId).toBe("goal-test-on-generation");
    expect(r.reason).toBeUndefined();
  });
  it("unknown id → abstain", () => {
    const r = validateResult(text, { ...good, misconceptionId: "made-up" }, "live");
    expect(r.misconceptionId).toBe("abstain");
    expect(r.reason).toMatch(/not in the taxonomy/);
  });
  it("non-verbatim excerpt → abstain with reason", () => {
    const r = validateResult(text, { ...good, evidenceExcerpt: "stopped when goal was generated" }, "live");
    expect(r.misconceptionId).toBe("abstain");
    expect(r.reason).toMatch(/word-for-word/);
    expect(r.candidates).toHaveLength(1);
  });
  it("trims whitespace but stays case-sensitive", () => {
    expect(validateResult(text, { ...good, evidenceExcerpt: "  as soon as the goal  " }, "live").misconceptionId).toBe(
      "goal-test-on-generation",
    );
    expect(validateResult(text, { ...good, evidenceExcerpt: "As Soon as the goal" }, "live").misconceptionId).toBe("abstain");
  });
  it("confidence below threshold → abstain", () => {
    const r = validateResult(text, { ...good, confidence: 0.2 }, "live");
    expect(r.misconceptionId).toBe("abstain");
    expect(r.reason).toMatch(/below/);
  });
  it("drops out-of-range or duplicate hints when rejecting engine output", () => {
    const candidate = good.candidates[0];
    for (const candidates of [[{ ...candidate, score: 1.1 }], [candidate, candidate]]) {
      expect(validateResult(text, { ...good, candidates }, "live")).toMatchObject({
        misconceptionId: "abstain",
        candidates: [],
      });
    }
  });
  it("garbage input → abstain", () => {
    for (const g of [null, 42, "hello", { foo: 1 }, []]) {
      expect(validateResult(text, g, "sample").misconceptionId).toBe("abstain");
    }
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { HELDOUT } from "@/data/heldout";
import { cleanSampleEngine } from "@/engine/sample/classify";
import { runEval } from "@/eval/runEval";
import { demoEngine, state, store } from "@/store/memory";

describe("TA corrections become exemplars", () => {
  beforeEach(() => store.reset());

  it("a near-paraphrase abstains before a move and lands after it", () => {
    const original = "the target landed on the fringe and I called the search finished right there";
    const paraphrase = "the target landed on the fringe so I called the search finished";
    expect(demoEngine().classify(paraphrase).misconceptionId).toBe("abstain");
    const r = store.submit("Q2", original);
    expect(state().reports.find((x) => x.id === r.id)!.assignment.label).toBe("abstain");
    store.move(r.id, "goal-test-on-generation");
    expect(demoEngine().classify(paraphrase).misconceptionId).toBe("goal-test-on-generation");
  });

  it("held-out eval is unaffected by demo exemplars", async () => {
    const before = await runEval("sample", (it) => cleanSampleEngine.classify(it.text), HELDOUT);
    const r = store.submit("Q2", "the target landed on the fringe and I called the search finished right there");
    store.move(r.id, "goal-test-on-generation");
    const after = await runEval("sample", (it) => cleanSampleEngine.classify(it.text), HELDOUT);
    expect(after.metrics).toEqual(before.metrics);
  });
});

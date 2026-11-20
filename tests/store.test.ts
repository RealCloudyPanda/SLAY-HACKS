import { beforeEach, describe, expect, it } from "vitest";
import { abstain } from "@/engine/contract";
import { state, store } from "@/store/memory";

describe("store", () => {
  beforeEach(() => store.reset());

  it("lazily seeds 60 classified reports", () => {
    expect(state().reports).toHaveLength(60);
    expect(state().reports.every((r) => r.assignment.source === "ai")).toBe(true);
  });
  it("submit redacts and classifies", () => {
    const r = store.submit("Q2", "my name is Sam, I stopped as soon as the goal was added to the open list");
    expect(r.text).toContain("[name]");
    expect(state().reports).toHaveLength(61);
  });
  it("confirm, move, reject, rename are applied and logged", () => {
    const id = state().reports.find((r) => r.assignment.label !== "abstain")!.id;
    store.confirm(id);
    expect(state().reports.find((r) => r.id === id)!.assignment.source).toBe("ta-confirmed");
    store.move(id, "g-h-swapped");
    expect(state().reports.find((r) => r.id === id)!.assignment).toMatchObject({ label: "g-h-swapped", source: "ta-moved" });
    store.reject(id);
    expect(state().reports.find((r) => r.id === id)!.assignment).toMatchObject({ label: "abstain", source: "ta-rejected" });
    store.rename("g-h-swapped", "g vs h");
    expect(state().misconceptions.find((m) => m.id === "g-h-swapped")!.name).toBe("g vs h");
    expect(state().corrections.map((c) => c.kind)).toEqual(["rename", "reject", "move", "confirm"]);
  });
  it("rerun skips TA-corrected reports", async () => {
    const id = state().reports[0].id;
    store.move(id, "bigger-h-always-better");
    const res = await store.rerun(() => abstain("live", "Live engine error: 500"), { kind: "live", model: "m" });
    expect(res.processed).toBe(59);
    expect(res.failed).toBe(59);
    expect(state().reports[0].assignment.label).toBe("bigger-h-always-better");
  });
  it("keeps in-flight TA corrections and classifies duplicate text with each report's question", async () => {
    const text = "I got really lost in the middle";
    const first = store.submit("Q1", text);
    const second = store.submit("Q2", text);
    const edited = state().reports[0];
    const gate = Promise.withResolvers<void>();
    const pending = store.rerun(async (report) => {
      await gate.promise;
      return abstain("live", report.questionId);
    }, { kind: "live" }, 6);

    store.move(edited.id, "bigger-h-always-better");
    const submittedDuringRun = store.submit("Q3", text);
    gate.resolve();

    expect(await pending).toMatchObject({ processed: 61, superseded: false });
    expect(edited.assignment).toMatchObject({ label: "bigger-h-always-better", source: "ta-moved" });
    expect(first.assignment.reason).toBe("Q1");
    expect(second.assignment.reason).toBe("Q2");
    expect(submittedDuringRun.assignment.engine).toBe("sample");
  });
  it.each(["reset", "newer rerun"])("discards an older in-flight run after a %s", async (event) => {
    const gate = Promise.withResolvers<void>();
    const pending = store.rerun(async () => {
      await gate.promise;
      return abstain("live", "older classification");
    }, { kind: "live", model: "old" }, 6);

    if (event === "reset") store.reset();
    else await store.rerun(() => abstain("sample", "newer classification"), { kind: "sample" });
    gate.resolve();

    expect(await pending).toMatchObject({ processed: 0, superseded: true });
    expect(state().engine).toEqual({ kind: "sample" });
    expect(state().reports.every((item) => item.assignment.engine === "sample")).toBe(true);
  });
  it("reset clears corrections", () => {
    store.rename("g-h-swapped", "x");
    store.reset();
    expect(state().corrections).toHaveLength(0);
  });
});

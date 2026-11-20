import { beforeEach, describe, expect, it } from "vitest";
import { createCallerFactory } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { store } from "@/store/memory";

const caller = createCallerFactory(appRouter)({});

describe("routers", () => {
  beforeEach(() => store.reset());

  it("submit returns no label and shows up in dashboard totals", async () => {
    const before = (await caller.dashboard.summary()).totals.reports;
    const res = await caller.report.submit({ questionId: "Q2", text: "I stopped as soon as the goal was added to the open list" });
    expect(res).toEqual({ ok: true });
    expect((await caller.dashboard.summary()).totals.reports).toBe(before + 1);
  });
  it("move updates counts and the log", async () => {
    const c = await caller.cluster.byId({ id: "g-h-swapped" });
    const id = c.reports[0].id;
    await caller.correction.move({ reportId: id, to: "bigger-h-always-better" });
    const after = await caller.cluster.byId({ id: "g-h-swapped" });
    expect(after.reports.length).toBe(c.reports.length - 1);
    const d = await caller.dashboard.summary();
    expect(d.recentCorrections[0]).toMatchObject({ kind: "move", reportId: id, to: "bigger-h-always-better" });
  });
  it("rejects invalid input with zod", async () => {
    await expect(caller.report.submit({ questionId: "Q2", text: "short" })).rejects.toThrow();
    await expect(caller.correction.move({ reportId: "s01", to: "nope" as never })).rejects.toThrow();
    await expect(caller.cluster.byId({ id: "nope" })).rejects.toThrow(/No such/);
  });
  it("compare reports reach numbers and a sentence", async () => {
    const c = await caller.compare.get();
    expect(c.sentence.length).toBeGreaterThan(20);
    expect(c.reach.byMisconception).toBeGreaterThanOrEqual(c.reach.byQuestion);
  });
});

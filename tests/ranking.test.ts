import { describe, expect, it } from "vitest";
import { heatmap, heatStep } from "@/domain/heatmap";
import { teachFirst } from "@/domain/ranking";

describe("teachFirst", () => {
  it("orders by count, then distinct questions, then confirmed, then id", () => {
    const r = teachFirst([
      { questionId: "Q1", label: "g-h-swapped" },
      { questionId: "Q2", label: "g-h-swapped" },
      { questionId: "Q1", label: "bigger-h-always-better" },
      { questionId: "Q1", label: "bigger-h-always-better" },
      { questionId: "Q3", label: "closed-never-reopened", source: "ta-confirmed" },
      { questionId: "Q4", label: "closed-never-reopened" },
      { questionId: "Q4", label: "abstain" },
    ]);
    expect(r.slice(0, 3).map((x) => x.id)).toEqual(["closed-never-reopened", "g-h-swapped", "bigger-h-always-better"]);
    expect(r[0].reason).toBe("2 reports across Q3, Q4");
    expect(r).toHaveLength(6);
    expect(r[5].count).toBe(0);
  });
  it("heatmap steps 1..5 relative to max", () => {
    expect(heatStep(0, 5)).toBe(0);
    expect(heatStep(1, 5)).toBe(1);
    expect(heatStep(5, 5)).toBe(5);
    const h = heatmap([{ questionId: "Q2", label: "g-h-swapped" }], ["g-h-swapped"]);
    expect(h.rows[0].cells.map((c) => c.count)).toEqual([0, 1, 0, 0, 0, 0]);
  });
});

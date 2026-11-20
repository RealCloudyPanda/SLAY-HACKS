import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/domain/questions";
import { TAXONOMY } from "@/domain/taxonomy";
import { MISCONCEPTION_IDS } from "@/domain/types";

describe("taxonomy", () => {
  it("has six unique ids matching SPEC 5.2", () => {
    const ids = TAXONOMY.map((t) => t.id);
    expect(new Set(ids).size).toBe(6);
    expect([...ids].sort()).toEqual([...MISCONCEPTION_IDS].sort());
  });
  it("every misconception has a name, definition and teaching hint", () => {
    for (const t of TAXONOMY) {
      expect(t.defaultName.length).toBeGreaterThan(5);
      expect(t.definition.length).toBeGreaterThan(10);
      expect(t.teachingHint.length).toBeGreaterThan(10);
    }
  });
  it("lists Q1..Q5 plus Not sure", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(["Q1", "Q2", "Q3", "Q4", "Q5", "NS"]);
  });
});

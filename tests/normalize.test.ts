import { describe, expect, it } from "vitest";
import { splitClauses } from "@/engine/sample/clauses";
import { normalize, tokens } from "@/engine/sample/normalize";
import { SEED } from "@/data/seed";

describe("normalize", () => {
  it("maps synonyms to canonical tokens", () => {
    expect(normalize("my g(n) and the cost-so-far")).toBe("my gcost and the gcost");
    expect(normalize("h of n vs the estimate")).toBe("hcost vs the hcost");
    expect(normalize("the f value")).toBe("the fcost");
    expect(normalize("explored set, visited set, closed list")).toBe("closedset closedset closedset");
    expect(normalize("frontier fringe priority queue open list")).toBe("openlist openlist openlist openlist");
  });
  it("drops stopwords in tokens", () => {
    expect(tokens("I thought the frontier is done")).toEqual(["thought", "openlist", "done"]);
  });
});

describe("splitClauses", () => {
  it("splits on punctuation and connectives", () => {
    expect(splitClauses("I stopped early, because the goal was there but why").map((c) => c.text)).toEqual([
      "I stopped early",
      "the goal was there",
      "why",
    ]);
  });
  it("every clause maps back to an exact substring of the original", () => {
    for (const s of SEED) {
      for (const c of splitClauses(s.text)) {
        expect(s.text.slice(c.start, c.end)).toBe(c.text);
        expect(s.text.includes(c.text)).toBe(true);
      }
    }
  });
});

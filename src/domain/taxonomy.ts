import type { Misconception, MisconceptionId } from "./types";

type TaxonomyEntry = Omit<Misconception, "name">;

export const TAXONOMY: readonly TaxonomyEntry[] = [
  {
    id: "goal-test-on-generation",
    defaultName: "A* stops when the goal is generated",
    definition: "the search can return as soon as the goal is added to the open list",
    teachingHint:
      "Optimality needs the goal test when the goal is popped (expanded), because a cheaper path may still be on the frontier.",
  },
  {
    id: "admissible-means-consistent",
    defaultName: "Admissible and consistent are the same",
    definition: "every admissible heuristic is consistent (or the two words are interchangeable)",
    teachingHint:
      "Consistency is a per-edge triangle inequality; it implies admissibility but not the reverse. Show a counterexample.",
  },
  {
    id: "any-heuristic-optimal",
    defaultName: "A* is optimal with any heuristic",
    definition: "A* returns an optimal path regardless of the heuristic",
    teachingHint:
      "Optimality needs admissibility (tree search) or consistency (graph search without reopening).",
  },
  {
    id: "g-h-swapped",
    defaultName: "Mixing up g(n) and h(n)",
    definition: "g is the estimate and h is the cost so far, or f is computed with the wrong parts",
    teachingHint: "g is known cost from the start; h is the estimate to the goal; f = g + h ranks the frontier.",
  },
  {
    id: "closed-never-reopened",
    defaultName: "Closed nodes never need reopening",
    definition: "once a node is in the closed set its cost can never improve",
    teachingHint:
      "With an inconsistent heuristic, a cheaper path to a closed node can appear; graph search must reopen it or lose optimality.",
  },
  {
    id: "bigger-h-always-better",
    defaultName: "A bigger heuristic is always better",
    definition: "a larger h is always preferable, even if it overestimates",
    teachingHint:
      "Larger is better only while staying admissible (dominance); overestimating trades optimality for speed.",
  },
];

export function taxonomyEntry(id: MisconceptionId): TaxonomyEntry {
  const e = TAXONOMY.find((t) => t.id === id);
  if (!e) throw new Error(`Unknown misconception ${id}`);
  return e;
}


export function defaultMisconceptions(): Misconception[] {
  return TAXONOMY.map((t) => ({ ...t, name: t.defaultName }));
}

import type { LabelledItem, Label, QuestionId } from "@/domain/types";

/**
 * 20 held-out synthetic reports, frozen before any engine tuning.
 * Never read while tuning cues or thresholds; only the eval imports this file.
 */
const raw: [QuestionId, Label, string][] = [
  ["Q2", "goal-test-on-generation", "the moment the target landed on the fringe I called it done, but the key pops two more nodes first"],
  ["Q4", "goal-test-on-generation", "pop vs push confuses me, I ended the run on push of the goal and got a longer route"],
  ["Q5", "goal-test-on-generation", "I terminated when the target state was created as a child, is the check supposed to happen later"],
  ["Q1", "admissible-means-consistent", "since Manhattan never overshoots I figured that automatically makes it consistent"],
  ["Q3", "admissible-means-consistent", "I proved the estimate is a lower bound everywhere and wrote that this shows consistency"],
  ["NS", "admissible-means-consistent", "to me admissible = consistent, I can't find an example where one holds and not the other"],
  ["Q5", "any-heuristic-optimal", "I wrote weighted A* is still guaranteed shortest because A* guarantees that whatever h you plug in"],
  ["Q2", "any-heuristic-optimal", "my reasoning was that the heuristic only affects speed, A* will be optimal with whatever estimate"],
  ["Q4", "any-heuristic-optimal", "I said yes optimal, because A* in general always returns the cheapest route"],
  ["Q2", "g-h-swapped", "I put the cost-so-far where the estimate goes, so every f in my table is shifted"],
  ["Q3", "g-h-swapped", "I kept treating h as the distance already travelled and g as the guess to the target"],
  ["Q4", "g-h-swapped", "my f column is the estimate plus the parent's estimate, I left out the actual path cost"],
  ["Q4", "closed-never-reopened", "I assumed anything in the explored set is settled for good, so I dropped the better route to F"],
  ["Q2", "closed-never-reopened", "a cheaper way into an already explored node showed up and I ignored it, I thought explored means final"],
  ["Q5", "bigger-h-always-better", "I argued 2h beats h because a heuristic that overshoots more is more informed and that is always good"],
  ["Q1", "bigger-h-always-better", "I chose whichever estimate had the largest values, figured larger always wins"],
  ["Q4", "abstain", "no clue what happened in this one, my numbers drifted somewhere"],
  ["NS", "abstain", "the slides and the homework seem to use different notation and I gave up"],
  ["Q3", "abstain", "I thought it never overshoots so the explored nodes are final, not sure which part is wrong"],
  ["Q5", "abstain", "I kind of get it but not really, the weight part is fuzzy"],
];

export const HELDOUT: readonly LabelledItem[] = raw.map(([questionId, gold, text], i) => ({
  id: `h${String(i + 1).padStart(2, "0")}`,
  questionId,
  text,
  gold,
}));

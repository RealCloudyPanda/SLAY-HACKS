import type { MisconceptionId } from "@/domain/types";

export interface Cue {
  pattern: RegExp;
  weight: number;
}

/**
 * Weighted cue patterns over NORMALISED text (see normalize.ts: gcost, hcost, fcost, closedset, openlist).
 * Negation is not a guard: students describe the belief they held ("isn't that the same thing").
 * Tuned on the seed set only.
 */
export const CUES: Record<MisconceptionId, Cue[]> = {
  "goal-test-on-generation": [
    { pattern: /goal.{0,40}\b(generat|added|add|push|pushed|showed up|appear|got generated|in openlist|on openlist|onto openlist)/, weight: 1.2 },
    { pattern: /\b(generat\w*|push\w*|added)\b.{0,30}\bgoal/, weight: 0.8 },
    { pattern: /\b(stop|stopped|stops|return|returned|ended|end|quit|done|terminat\w*)\b.{0,50}\b(goal|target)/, weight: 0.6 },
    { pattern: /\b(wait|pop|popped|expanded|expansions?)\b.{0,40}\bgoal|\bgoal\b.{0,40}\b(pop|popped|expanded)/, weight: 0.5 },
    { pattern: /\bas soon as\b|\bthe moment\b|\bimmediately\b|\bsecond you see\b|\bfound it\b/, weight: 0.4 },
    { pattern: /\bpop vs push\b|\bpush of the goal\b/, weight: 1.0 },
    { pattern: /\b(gets|got|was|is) pushed\b/, weight: 0.6 },
  ],
  "admissible-means-consistent": [
    { pattern: /admissib\w*.{0,80}consisten|consisten\w*.{0,80}admissib/, weight: 1.6 },
    { pattern: /(never overestimat\w*|never overshoots?|lower bound).{0,80}consisten/, weight: 1.2 },
    { pattern: /\bsame thing\b|interchangeabl|\bidentical\b|\btwo words\b|admissible = consistent/, weight: 0.5 },
    { pattern: /\bconsisten\w*/, weight: 0.5 },
    { pattern: /\bnever overestimat\w*|\bovershoot/, weight: 0.2 },
  ],
  "any-heuristic-optimal": [
    { pattern: /\b(always|any|whatever|regardless|no matter)\b.{0,40}\b(optimal|shortest|cheapest)/, weight: 1.2 },
    { pattern: /\b(optimal|shortest|cheapest)\b.{0,50}\b(any|whatever|regardless|no matter|always)\b/, weight: 1.0 },
    { pattern: /\bweighted a\b.{0,40}\b(still|optimal|shortest)/, weight: 0.8 },
    { pattern: /\ba (?:is )?(?:always )?optimal\b|\bis a always optimal\b|\bwhole point of a\b/, weight: 0.9 },
    { pattern: /\bguaranteed?\b|\boptimal\b/, weight: 0.3 },
    { pattern: /\bdoesn't matter which\b|\bshouldn't matter\b/, weight: 0.5 },
  ],
  "g-h-swapped": [
    { pattern: /\bswap\w*|\bbackwards\b|\bmixed up\b|\bmix up\b|\bwrong column\b/, weight: 0.9 },
    { pattern: /\binstead of (?:the )?(gcost|path)\b/, weight: 1.0 },
    { pattern: /\bhcost\b.{0,40}\bgcost\b|\bgcost\b.{0,40}\bhcost\b/, weight: 0.7 },
    { pattern: /\bg\b.{0,25}\bh\b|\bh\b.{0,25}\bg\b/, weight: 0.6 },
    { pattern: /\bfcost\b.{0,40}\b(wrong|off|shifted)\b|\bmy fcost\b/, weight: 0.5 },
    { pattern: /\b(summed|plus|added)\b.{0,30}(hcost|heuristic)\b.{0,15}\bparent|parent'?s? hcost|two heuristic/, weight: 1.0 },
    { pattern: /\bwhat g is\b|\bwhich one is\b/, weight: 0.6 },
  ],
  "closed-never-reopened": [
    { pattern: /\bclosedset\b/, weight: 0.8 },
    { pattern: /\breopen\w*|\brevisit\w*|\blook at it again\b|\bever look\b/, weight: 0.9 },
    { pattern: /\b(cheaper|better)\b (?:path|route|way|g)/, weight: 0.5 },
    { pattern: /\bclosed\b/, weight: 0.5 },
    { pattern: /\b(final|settled|never improve|never get|for good)\b/, weight: 0.5 },
  ],
  "bigger-h-always-better": [
    { pattern: /\b(bigger|larger|largest|more informed)\b/, weight: 0.9 },
    { pattern: /\b(bigger|larger|largest)\b.{0,40}\b(better|best|wins|helps)\b/, weight: 1.2 },
    { pattern: /\balways\b (better|good|helps|wins)|\bstrictly better\b/, weight: 0.5 },
    { pattern: /\b2h\b|\bdoubl\w*|\btimes 3\b/, weight: 0.3 },
  ],
};

/** Words describing each misconception, added to its TF-IDF profile document. */
export const PROFILE_TERMS: Record<MisconceptionId, string> = {
  "goal-test-on-generation": "goal generated added openlist pushed stop return soon found goal test pop expanded generation",
  "admissible-means-consistent": "admissible consistent same overestimate never overestimates consistency interchangeable edges",
  "any-heuristic-optimal": "optimal any heuristic always shortest path guaranteed weighted regardless cheapest",
  "g-h-swapped": "g h gcost hcost fcost swapped mixed backwards parent sum plus column cost so far",
  "closed-never-reopened": "closedset closed reopen node cheaper path final never again revisit explored",
  "bigger-h-always-better": "bigger larger heuristic better informed overestimates numbers best values",
};

export function cueSum(normalised: string, id: MisconceptionId): number {
  let sum = 0;
  for (const c of CUES[id]) if (c.pattern.test(normalised)) sum += c.weight;
  return sum;
}

export const squash = (sum: number) => 1 - Math.exp(-sum);

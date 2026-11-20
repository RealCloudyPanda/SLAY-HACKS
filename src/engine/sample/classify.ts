import { TAXONOMY } from "@/domain/taxonomy";
import type { MisconceptionId } from "@/domain/types";
import { validateResult, type EngineResult } from "../contract";
import { splitClauses } from "./clauses";
import { cueSum, PROFILE_TERMS, squash } from "./cues";
import { normalize, wordCount } from "./normalize";
import { TfIdf } from "./tfidf";

/** Thresholds tuned on the seed set only; shown on /ta/eval. */
export const TAU = 0.3;
export const DELTA = 0.12;
export const MIN_WORDS = 5;
/** If the runner-up is this strong on its own, the report mixes two ideas: abstain. */
export const MIX = 0.45;
export const W_CUE = 0.65;
export const W_SIM = 0.35;

export type Exemplars = Partial<Record<MisconceptionId, string[]>>;

export interface SampleEngine {
  classify(text: string): EngineResult;
  scores(text: string): { id: MisconceptionId; score: number }[];
}

export function createSampleEngine(exemplars: Exemplars = {}): SampleEngine {
  const ids = TAXONOMY.map((t) => t.id);
  const profiles = TAXONOMY.map((t) =>
    [t.defaultName, t.definition, PROFILE_TERMS[t.id], ...(exemplars[t.id] ?? [])].join(" "),
  );
  const tfidf = new TfIdf(profiles);

  const scoreOne = (text: string, idx: number, sims?: number[]) => {
    const s = sims ?? tfidf.similarities(text);
    return W_CUE * squash(cueSum(normalize(text), ids[idx])) + W_SIM * s[idx];
  };

  const scores = (text: string) => {
    const sims = tfidf.similarities(text);
    return ids
      .map((id, i) => ({ id, score: round(scoreOne(text, i, sims), 3) }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  };

  const classify = (text: string): EngineResult => {
    const ranked = scores(text);
    const [top, second] = ranked;
    const candidates = ranked.slice(0, 2);
    const base = { evidenceExcerpt: "", confidence: 0, candidates, engine: "sample" as const };
    if (wordCount(text) < MIN_WORDS) return { ...base, misconceptionId: "abstain", reason: "Too short to tell" };
    if (top.score < TAU) return { ...base, misconceptionId: "abstain", reason: "No misconception matched strongly" };
    if (second.score >= MIX)
      return { ...base, misconceptionId: "abstain", reason: "Mentions two misconceptions at once" };
    if (top.score - second.score < DELTA)
      return { ...base, misconceptionId: "abstain", reason: "Two misconceptions scored almost the same" };

    const confidence = round(Math.min(1, top.score) * Math.min(1, (top.score - second.score) / 0.3), 2);
    const idx = ids.indexOf(top.id);
    const clauses = splitClauses(text);
    let best = clauses[0];
    let bestScore = -1;
    for (const c of clauses) {
      const s = scoreOne(c.text, idx);
      if (s > bestScore) [best, bestScore] = [c, s];
    }
    return validateResult(
      text,
      { ...base, misconceptionId: top.id, evidenceExcerpt: best.text, confidence },
      "sample",
    );
  };

  return { classify, scores };
}

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;

/** Clean engine with no TA exemplars: used by eval so held-out numbers never depend on demo state. */
export const cleanSampleEngine = createSampleEngine();

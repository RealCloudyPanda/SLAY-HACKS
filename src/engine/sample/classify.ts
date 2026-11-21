import { TAXONOMY } from "@/domain/taxonomy";
import type { MisconceptionId } from "@/domain/types";
import { validateResult, type EngineResult } from "../contract";
import { splitClauses } from "./clauses";
import { cueSum, PROFILE_TERMS, squash } from "./cues";
import { normalize, wordCount } from "./normalize";
import { TfIdf } from "./tfidf";
import { reviewReason } from "./review";


export const TAU = 0.3;
export const DELTA = 0.12;
export const MIN_WORDS = 5;

export const MIX = 0.45;
export const W_CUE = 0.65;
export const W_SIM = 0.35;

export const W_EX = 0.6;

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
  const exDocs = ids.flatMap((id, idx) => (exemplars[id] ?? []).map((text) => ({ idx, text })));
  const tfidf = new TfIdf([...profiles, ...exDocs.map((e) => e.text)]);


  const sims = (text: string) => {
    const all = tfidf.similarities(text);
    const ex = ids.map(() => 0);
    exDocs.forEach((e, j) => (ex[e.idx] = Math.max(ex[e.idx], all[ids.length + j])));
    return { profile: all.slice(0, ids.length), ex };
  };

  const scoreOne = (text: string, idx: number, pre?: ReturnType<typeof sims>) => {
    const s = pre ?? sims(text);
    const base = W_CUE * squash(cueSum(normalize(text), ids[idx])) + W_SIM * s.profile[idx];
    return Math.max(base, W_EX * s.ex[idx]);
  };

  const scores = (text: string) => {
    const pre = sims(text);
    return ids
      .map((id, i) => ({ id, score: round(scoreOne(text, i, pre), 3) }))
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

    const needsReview = reviewReason(text, top.id);
    if (needsReview) return { ...base, candidates: [], misconceptionId: "abstain", reason: needsReview };

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


export const cleanSampleEngine = createSampleEngine();

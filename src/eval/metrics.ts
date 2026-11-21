import { MISCONCEPTION_IDS, QUESTION_IDS, type Label, type LabelledItem, type QuestionId } from "@/domain/types";

export interface Prediction {
  gold: Label;
  predicted: Label;
}

export interface Metrics {
  n: number;
  overallAgreement: number;
  accuracyWhenAnswered: number | null;
  issuedLabelPrecision: number | null;
  coverage: number | null;
  abstainRate: number;
  ambiguousCaught: number | null;
  counts: { correct: number; answered: number; answeredCorrect: number; goldNonAbstain: number; goldAbstain: number; abstained: number; issued: number; issuedCorrect: number };
}

const ratio = (a: number, b: number) => (b === 0 ? null : a / b);

export function computeMetrics(preds: Prediction[]): Metrics {
  const n = preds.length;
  const correct = preds.filter((p) => p.predicted === p.gold).length;
  const nonAbstainGold = preds.filter((p) => p.gold !== "abstain");
  const answered = nonAbstainGold.filter((p) => p.predicted !== "abstain");
  const answeredCorrect = answered.filter((p) => p.predicted === p.gold).length;
  const issued = preds.filter((p) => p.predicted !== "abstain");
  const issuedCorrect = issued.filter((p) => p.predicted === p.gold).length;
  const abstained = preds.filter((p) => p.predicted === "abstain").length;
  const goldAbstain = preds.filter((p) => p.gold === "abstain");
  const caught = goldAbstain.filter((p) => p.predicted === "abstain").length;
  return {
    n,
    overallAgreement: n ? correct / n : 0,
    issuedLabelPrecision: ratio(issuedCorrect, issued.length),
    accuracyWhenAnswered: ratio(answeredCorrect, answered.length),
    coverage: ratio(answered.length, nonAbstainGold.length),
    abstainRate: n ? abstained / n : 0,
    ambiguousCaught: ratio(caught, goldAbstain.length),
    counts: {
      correct,
      answered: answered.length,
      answeredCorrect,
      goldNonAbstain: nonAbstainGold.length,
      goldAbstain: goldAbstain.length,
      abstained,
      issued: issued.length,
      issuedCorrect,
    },
  };
}

export const LABELS: Label[] = [...MISCONCEPTION_IDS, "abstain"];

/** confusion[gold][predicted] = count. */
export function confusion(preds: Prediction[]): Record<Label, Record<Label, number>> {
  const m = Object.fromEntries(LABELS.map((g) => [g, Object.fromEntries(LABELS.map((p) => [p, 0]))])) as Record<
    Label,
    Record<Label, number>
  >;
  for (const p of preds) m[p.gold][p.predicted]++;
  return m;
}

/** Naive by-question baseline: predict the seed set's most common gold misconception for that question. */
export function byQuestionBaseline(seed: readonly LabelledItem[]): Record<QuestionId, Label> {
  const out = {} as Record<QuestionId, Label>;
  for (const q of QUESTION_IDS) {
    const counts = new Map<Label, number>();
    for (const s of seed) if (s.questionId === q && s.gold !== "abstain") counts.set(s.gold, (counts.get(s.gold) ?? 0) + 1);
    const best = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    out[q] = best ? best[0] : "abstain";
  }
  return out;
}

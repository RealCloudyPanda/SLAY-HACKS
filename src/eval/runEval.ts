import { SEED } from "@/data/seed";
import type { EngineKind, Label, LabelledItem, QuestionId } from "@/domain/types";
import type { EngineResult } from "@/engine/contract";
import { DELTA, MIN_WORDS, MIX, TAU, W_CUE, W_SIM } from "@/engine/sample/classify";
import { byQuestionBaseline, computeMetrics, confusion, type Metrics } from "./metrics";

export interface EvalMiss {
  id: string;
  questionId: QuestionId;
  text: string;
  gold: Label;
  predicted: Label;
  reason?: string;
}

export interface EvalReport {
  engine: EngineKind;
  model?: string;
  ranAt: string;
  size: number;
  metrics: Metrics;
  baseline: { overallAgreement: number; predictions: Record<QuestionId, Label> };
  confusion: Record<Label, Record<Label, number>>;
  misses: EvalMiss[];
  thresholds: Record<string, number>;
}

export type Classifier = (item: LabelledItem) => EngineResult | Promise<EngineResult>;

export async function runEval(
  engine: EngineKind,
  classify: Classifier,
  items: readonly LabelledItem[],
  model?: string,
): Promise<EvalReport> {
  const results = await Promise.all(items.map(async (it) => ({ it, r: await classify(it) })));
  const preds = results.map(({ it, r }) => ({ gold: it.gold, predicted: r.misconceptionId as Label }));
  const base = byQuestionBaseline(SEED);
  const baseAgree = items.filter((it) => base[it.questionId] === it.gold).length / items.length;
  return {
    engine,
    model,
    ranAt: new Date().toISOString(),
    size: items.length,
    metrics: computeMetrics(preds),
    baseline: { overallAgreement: baseAgree, predictions: base },
    confusion: confusion(preds),
    misses: results
      .filter(({ it, r }) => it.gold !== r.misconceptionId)
      .map(({ it, r }) => ({ id: it.id, questionId: it.questionId, text: it.text, gold: it.gold, predicted: r.misconceptionId, reason: r.reason })),
    thresholds: engine === "sample" ? { TAU, DELTA, MIX, MIN_WORDS, W_CUE, W_SIM } : { confidenceFloor: 0.5 },
  };
}

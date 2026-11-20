import type { Labelled } from "./ranking";
import { QUESTION_IDS, type MisconceptionId, type QuestionId } from "./types";

export interface HeatCell {
  questionId: QuestionId;
  count: number;
  /** 0 = empty, 1..5 = heat step. */
  step: number;
}
export interface HeatRow {
  id: MisconceptionId;
  total: number;
  cells: HeatCell[];
}

export function heatStep(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.max(1, Math.min(5, Math.ceil((count / max) * 5)));
}

/** Rows in the given (teach-first) order, columns Q1..Q5, NS. */
export function heatmap(reports: Labelled[], order: MisconceptionId[]): { rows: HeatRow[]; max: number } {
  const count = (id: MisconceptionId, q: QuestionId) => reports.filter((r) => r.label === id && r.questionId === q).length;
  const raw = order.map((id) => ({ id, counts: QUESTION_IDS.map((q) => count(id, q)) }));
  const max = Math.max(0, ...raw.flatMap((r) => r.counts));
  return {
    max,
    rows: raw.map((r) => ({
      id: r.id,
      total: r.counts.reduce((a, b) => a + b, 0),
      cells: QUESTION_IDS.map((q, i) => ({ questionId: q, count: r.counts[i], step: heatStep(r.counts[i], max) })),
    })),
  };
}

import { questionLabel } from "./questions";
import { joinQuestions, teachFirst, type Labelled, type TeachFirstItem } from "./ranking";
import { MISCONCEPTION_IDS, QUESTION_IDS, type Label, type MisconceptionId, type QuestionId } from "./types";

export interface CompareResult {
  byQuestion: { questionId: QuestionId; count: number }[];
  topQuestion: QuestionId | null;
  topQuestionMix: { label: Label; count: number }[];
  byMisconception: TeachFirstItem[];
  reach: { byQuestion: number; byMisconception: number };
  topQuestionIdea: MisconceptionId | null;
  agree: boolean;
}

export function compare(reports: Labelled[]): CompareResult {
  const byQuestion = QUESTION_IDS.map((q) => ({ questionId: q, count: reports.filter((r) => r.questionId === q).length }))
    .sort((a, b) => b.count - a.count || QUESTION_IDS.indexOf(a.questionId) - QUESTION_IDS.indexOf(b.questionId));
  const topQuestion = byQuestion[0]?.count ? byQuestion[0].questionId : null;
  const inTop = reports.filter((r) => r.questionId === topQuestion);
  const labels: Label[] = [...MISCONCEPTION_IDS, "abstain"];
  const topQuestionMix = labels
    .map((label) => ({ label, count: inTop.filter((r) => r.label === label).length }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count || (a.label === "abstain" ? 1 : b.label === "abstain" ? -1 : a.label.localeCompare(b.label)));
  const topIdea = topQuestionMix.find((m) => m.label !== "abstain");
  const byMisconception = teachFirst(reports);
  const first = byMisconception[0];
  return {
    byQuestion,
    topQuestion,
    topQuestionMix,
    byMisconception,
    reach: { byQuestion: topIdea ? reports.filter((r) => r.label === topIdea.label).length : 0, byMisconception: first?.count ?? 0 },
    topQuestionIdea: (topIdea?.label as MisconceptionId) ?? null,
    agree: !!topIdea && !!first && topIdea.label === first.id,
  };
}


export function compareSentence(c: CompareResult, nameOf: (id: MisconceptionId) => string): string {
  const first = c.byMisconception[0];
  if (!c.topQuestion || !first || first.count === 0) return "No reports yet, so there is nothing to compare.";
  const q = questionLabel(c.topQuestion);
  if (c.agree) return `Both views agree: start with '${nameOf(first.id)}', which reaches ${first.count} reports.`;
  return `Grouping by question says start with ${q}. But one explanation of '${nameOf(first.id)}' reaches ${first.count} reports across ${joinQuestions(first.questions)}, versus ${c.reach.byQuestion} across all reports for '${nameOf(c.topQuestionIdea!)}', the idea selected inside ${q}.`;
}

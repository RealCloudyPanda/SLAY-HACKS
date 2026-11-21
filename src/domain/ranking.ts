import { questionLabel } from "./questions";
import { MISCONCEPTION_IDS, QUESTION_IDS, type AssignmentSource, type Label, type MisconceptionId, type QuestionId } from "./types";


export interface Labelled {
  questionId: QuestionId;
  label: Label;
  source?: AssignmentSource;
}

export interface TeachFirstItem {
  id: MisconceptionId;
  count: number;
  questions: QuestionId[];
  confirmed: number;
  reason: string;
}

export function joinQuestions(qs: QuestionId[]): string {
  const l = qs.map(questionLabel);
  if (l.length <= 1) return l.join("");
  return `${l.slice(0, -1).join(", ")} and ${l[l.length - 1]}`;
}


export function teachFirst(reports: Labelled[]): TeachFirstItem[] {
  return MISCONCEPTION_IDS.map((id) => {
    const mine = reports.filter((r) => r.label === id);
    const questions = QUESTION_IDS.filter((q) => mine.some((r) => r.questionId === q));
    const confirmed = mine.filter((r) => r.source === "ta-confirmed" || r.source === "ta-moved").length;
    const reason =
      mine.length === 0
        ? "No reports yet"
        : `${mine.length} report${mine.length === 1 ? "" : "s"} across ${questions.map(questionLabel).join(", ")}`;
    return { id, count: mine.length, questions, confirmed, reason };
  }).sort(
    (a, b) =>
      b.count - a.count || b.questions.length - a.questions.length || b.confirmed - a.confirmed || a.id.localeCompare(b.id),
  );
}

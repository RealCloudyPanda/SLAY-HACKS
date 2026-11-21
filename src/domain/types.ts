export const QUESTION_IDS = ["Q1", "Q2", "Q3", "Q4", "Q5", "NS"] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export const MISCONCEPTION_IDS = [
  "goal-test-on-generation",
  "admissible-means-consistent",
  "any-heuristic-optimal",
  "g-h-swapped",
  "closed-never-reopened",
  "bigger-h-always-better",
] as const;
export type MisconceptionId = (typeof MISCONCEPTION_IDS)[number];

export type Label = MisconceptionId | "abstain";
export type EngineKind = "sample" | "live";
export type AssignmentSource = "ai" | "ta-confirmed" | "ta-moved" | "ta-rejected";

export interface Candidate {
  id: MisconceptionId;
  score: number;
}

export interface Assignment {
  label: Label;
  evidenceExcerpt: string;
  confidence: number;
  candidates: Candidate[];
  engine: EngineKind;
  source: AssignmentSource;
  reason?: string;
}

export interface StuckReport {
  id: string;
  questionId: QuestionId;
  text: string;
  createdAt: string;
  assignment: Assignment;
}

export interface Misconception {
  id: MisconceptionId;
  name: string;
  defaultName: string;
  definition: string;
  teachingHint: string;
}

export interface Correction {
  id: string;
  at: string;
  kind: "confirm" | "move" | "reject" | "rename";
  reportId?: string;
  from?: Label;
  to?: Label;
  misconceptionId?: MisconceptionId;
  oldName?: string;
  newName?: string;
}


export interface LabelledItem {
  id: string;
  questionId: QuestionId;
  text: string;
  gold: Label;
}

export function isMisconceptionId(v: string): v is MisconceptionId {
  return (MISCONCEPTION_IDS as readonly string[]).includes(v);
}

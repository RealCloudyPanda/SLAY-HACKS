import type { QuestionId } from "./types";

export interface HomeworkQuestion {
  id: QuestionId;
  short: string;
  prompt: string;
}


export const UNIT_NAME = "Unit 3: Heuristic search";

export const QUESTIONS: readonly HomeworkQuestion[] = [
  {
    id: "Q1",
    short: "Q1",
    prompt:
      "A robot moves on a 4-connected grid with step cost 1. Is straight-line distance admissible here? Is Manhattan distance? Is either consistent?",
  },
  {
    id: "Q2",
    short: "Q2",
    prompt: "Trace A* tree search on Graph G from S to the goal. List the expansion order with g, h and f values.",
  },
  { id: "Q3", short: "Q3", prompt: "For Graph H and the given h table, show whether h is consistent." },
  {
    id: "Q4",
    short: "Q4",
    prompt:
      "Run A* graph search with a closed set on Graph K, where h is admissible but not consistent. Does it return the optimal path?",
  },
  {
    id: "Q5",
    short: "Q5",
    prompt: "Weighted A* uses f = g + 2·h. Is the returned path guaranteed to be optimal? Explain.",
  },
  { id: "NS", short: "Not sure", prompt: "Not sure which question" },
];

export function questionLabel(id: QuestionId): string {
  return id === "NS" ? "Not sure" : id;
}

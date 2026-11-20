import { z } from "zod";
import { compare } from "@/domain/compare";
import { MISCONCEPTION_IDS, QUESTION_IDS, type MisconceptionId, type StuckReport } from "@/domain/types";
import { state } from "@/store/memory";

export const QuestionIdSchema = z.enum(QUESTION_IDS);
export const MisconceptionIdSchema = z.enum(MISCONCEPTION_IDS);

export const nameOf = (id: MisconceptionId) => state().misconceptions.find((m) => m.id === id)?.name ?? id;
export const labelled = (rs: StuckReport[]) =>
  rs.map((r) => ({ questionId: r.questionId, label: r.assignment.label, source: r.assignment.source }));
export const reviewItems = () => state().reports.filter((r) => r.assignment.label === "abstain");
export const currentCompare = () => compare(labelled(state().reports));

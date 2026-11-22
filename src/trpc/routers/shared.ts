import { z } from "zod";
import { MISCONCEPTION_IDS, QUESTION_IDS } from "@/domain/types";

export const QuestionIdSchema = z.enum(QUESTION_IDS);
export const MisconceptionIdSchema = z.enum(MISCONCEPTION_IDS);


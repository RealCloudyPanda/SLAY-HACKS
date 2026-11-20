import { z } from "zod";
import { store } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";
import { QuestionIdSchema } from "./shared";

export const SubmitInput = z.object({
  questionId: QuestionIdSchema,
  text: z.string().trim().min(10, "Write at least 10 characters").max(280, "Keep it under 280 characters"),
});

export const reportRouter = createTRPCRouter({
  /** Returns no label: students never see how their report was classified. */
  submit: baseProcedure.input(SubmitInput).mutation(({ input }) => {
    store.submit(input.questionId, input.text);
    return { ok: true as const };
  }),
});

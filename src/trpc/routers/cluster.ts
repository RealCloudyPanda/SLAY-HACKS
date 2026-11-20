import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { QUESTION_IDS } from "@/domain/types";
import { state } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";
import { MisconceptionIdSchema } from "./shared";

export const clusterRouter = createTRPCRouter({
  byId: baseProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const parsed = MisconceptionIdSchema.safeParse(input.id);
    if (!parsed.success) throw new TRPCError({ code: "NOT_FOUND", message: "No such misconception" });
    const s = state();
    const misconception = s.misconceptions.find((m) => m.id === parsed.data)!;
    const reports = s.reports
      .filter((r) => r.assignment.label === parsed.data)
      .sort((a, b) => b.assignment.confidence - a.assignment.confidence || a.id.localeCompare(b.id));
    const countsByQuestion = QUESTION_IDS.map((q) => ({ questionId: q, count: reports.filter((r) => r.questionId === q).length }));
    return { misconception, reports, countsByQuestion, all: s.misconceptions.map((m) => ({ id: m.id, name: m.name })) };
  }),
});

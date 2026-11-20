import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { store } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";
import { MisconceptionIdSchema } from "./shared";

const guard = <T>(fn: () => T): T => {
  try {
    return fn();
  } catch (e) {
    throw new TRPCError({ code: "BAD_REQUEST", message: (e as Error).message });
  }
};
const ReportRef = z.object({ reportId: z.string().min(1) });

export const correctionRouter = createTRPCRouter({
  confirm: baseProcedure.input(ReportRef).mutation(({ input }) => guard(() => store.confirm(input.reportId))),
  move: baseProcedure
    .input(ReportRef.extend({ to: MisconceptionIdSchema }))
    .mutation(({ input }) => guard(() => store.move(input.reportId, input.to))),
  reject: baseProcedure.input(ReportRef).mutation(({ input }) => guard(() => store.reject(input.reportId))),
  rename: baseProcedure
    .input(z.object({ misconceptionId: MisconceptionIdSchema, name: z.string().trim().min(1).max(60) }))
    .mutation(({ input }) => guard(() => store.rename(input.misconceptionId, input.name))),
});

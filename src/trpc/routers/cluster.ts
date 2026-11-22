import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { teachingSnapshot } from "@/domain/teachingSnapshot";
import { state } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";
import { MisconceptionIdSchema } from "./shared";

export const clusterRouter = createTRPCRouter({
  byId: baseProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const parsed = MisconceptionIdSchema.safeParse(input.id);
    if (!parsed.success) throw new TRPCError({ code: "NOT_FOUND", message: "No such misconception" });
    return teachingSnapshot(state()).cluster(parsed.data);
  }),
});

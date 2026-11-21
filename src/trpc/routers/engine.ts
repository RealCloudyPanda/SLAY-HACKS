import { z } from "zod";
import { classifyLive, LiveConfigSchema, MAX_CONCURRENT } from "@/engine/live/openaiCompatible";
import { demoEngine, store } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";


export const engineRouter = createTRPCRouter({
  rerun: baseProcedure
    .input(z.discriminatedUnion("engine", [z.object({ engine: z.literal("sample") }), LiveConfigSchema.extend({ engine: z.literal("live") })]))
    .mutation(async ({ input }) => {
      if (input.engine === "sample") {
        const sample = demoEngine();
        return store.rerun(({ text }) => sample.classify(text), { kind: "sample" });
      }
      return store.rerun(
        ({ text, questionId }) => classifyLive(text, questionId, input),
        { kind: "live", model: input.model },
        MAX_CONCURRENT,
      );
    }),
  test: baseProcedure.input(LiveConfigSchema).mutation(async ({ input }) => {
    const r = await classifyLive("I stopped the search as soon as the goal was added to the open list", "Q2", input);
    if (r.reason?.startsWith("Live engine error")) return { ok: false, message: r.reason };
    return { ok: true, message: `Connected. Test sentence → ${r.misconceptionId}${r.misconceptionId === "abstain" ? ` (${r.reason})` : ""}` };
  }),
});

import { z } from "zod";
import { classifyLive, LiveConfigSchema, MAX_CONCURRENT, pool } from "@/engine/live/openaiCompatible";
import { demoEngine, state, store } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";

// Inputs here can carry an API key: never log them (ADR 0004).
export const engineRouter = createTRPCRouter({
  rerun: baseProcedure
    .input(z.discriminatedUnion("engine", [z.object({ engine: z.literal("sample") }), LiveConfigSchema.extend({ engine: z.literal("live") })]))
    .mutation(async ({ input }) => {
      if (input.engine === "sample") return store.rerun((t) => demoEngine().classify(t), { kind: "sample" });
      const cache = new Map<string, Awaited<ReturnType<typeof classifyLive>>>();
      const targets = state().reports.filter((r) => r.assignment.source === "ai");
      await pool(targets, MAX_CONCURRENT, async (r) => {
        cache.set(r.text, await classifyLive(r.text, r.questionId, input));
      });
      return store.rerun((t) => cache.get(t) ?? demoEngine().classify(t), { kind: "live", model: input.model });
    }),
  test: baseProcedure.input(LiveConfigSchema).mutation(async ({ input }) => {
    const r = await classifyLive("I stopped the search as soon as the goal was added to the open list", "Q2", input);
    if (r.reason?.startsWith("Live engine error")) return { ok: false, message: r.reason };
    return { ok: true, message: `Connected. Test sentence → ${r.misconceptionId}${r.misconceptionId === "abstain" ? ` (${r.reason})` : ""}` };
  }),
});

import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  health: baseProcedure.query(() => ({ ok: true as const, service: "office-hours-heatmap" })),
});

export type AppRouter = typeof appRouter;

import { baseProcedure, createTRPCRouter } from "../init";
import { adminRouter } from "./admin";
import { clusterRouter } from "./cluster";
import { compareRouter } from "./compare";
import { correctionRouter } from "./correction";
import { dashboardRouter } from "./dashboard";
import { engineRouter } from "./engine";
import { evalRouter } from "./eval";
import { reportRouter } from "./report";
import { reviewRouter } from "./review";

export const appRouter = createTRPCRouter({
  health: baseProcedure.query(() => ({ ok: true as const, service: "office-hours-heatmap" })),
  report: reportRouter,
  dashboard: dashboardRouter,
  cluster: clusterRouter,
  review: reviewRouter,
  correction: correctionRouter,
  compare: compareRouter,
  admin: adminRouter,
  eval: evalRouter,
  engine: engineRouter,
});

export type AppRouter = typeof appRouter;

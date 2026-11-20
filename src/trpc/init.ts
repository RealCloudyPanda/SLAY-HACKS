import { initTRPC } from "@trpc/server";
import { cache } from "react";

/** Per-request context. The app has no auth and no database, so it is empty. */
export const createTRPCContext = cache(async () => ({}));

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

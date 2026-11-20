import { store } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";

export const adminRouter = createTRPCRouter({
  reset: baseProcedure.mutation(() => {
    store.reset();
    return { ok: true as const };
  }),
});

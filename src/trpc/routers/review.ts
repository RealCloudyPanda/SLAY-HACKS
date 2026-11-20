import { state } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";
import { reviewItems } from "./shared";

export const reviewRouter = createTRPCRouter({
  list: baseProcedure.query(() => ({
    reports: reviewItems(),
    misconceptions: state().misconceptions.map((m) => ({ id: m.id, name: m.name })),
  })),
});

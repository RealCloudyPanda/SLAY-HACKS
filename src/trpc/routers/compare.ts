import { compareSentence } from "@/domain/compare";
import { baseProcedure, createTRPCRouter } from "../init";
import { currentCompare, nameOf } from "./shared";

export const compareRouter = createTRPCRouter({
  get: baseProcedure.query(() => {
    const c = currentCompare();
    return {
      ...c,
      byMisconception: c.byMisconception.map((m) => ({ ...m, name: nameOf(m.id) })),
      topQuestionMix: c.topQuestionMix.map((m) => ({ ...m, name: m.label === "abstain" ? "Needs review" : nameOf(m.label) })),
      topQuestionIdeaName: c.topQuestionIdea ? nameOf(c.topQuestionIdea) : null,
      sentence: compareSentence(c, nameOf),
    };
  }),
});

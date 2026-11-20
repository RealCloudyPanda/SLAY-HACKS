import { HELDOUT } from "@/data/heldout";
import { cleanSampleEngine } from "@/engine/sample/classify";
import { runEval } from "@/eval/runEval";
import { baseProcedure, createTRPCRouter } from "../init";

export const evalRouter = createTRPCRouter({
  /** Sample engine on the held-out set, with a clean engine (no TA exemplars). */
  run: baseProcedure.query(() => runEval("sample", (it) => cleanSampleEngine.classify(it.text), HELDOUT)),
});

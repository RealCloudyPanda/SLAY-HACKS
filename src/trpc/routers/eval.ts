import { HELDOUT } from "@/data/heldout";
import { classifyLive, LiveConfigSchema, MAX_CONCURRENT } from "@/engine/live/openaiCompatible";
import { pool } from "@/engine/pool";
import { cleanSampleEngine } from "@/engine/sample/classify";
import { runEval } from "@/eval/runEval";
import { baseProcedure, createTRPCRouter } from "../init";

export const evalRouter = createTRPCRouter({

  run: baseProcedure.query(() => runEval("sample", (it) => cleanSampleEngine.classify(it.text), HELDOUT)),

  runLive: baseProcedure.input(LiveConfigSchema).mutation(async ({ input }) => {
    const results = await pool(HELDOUT, MAX_CONCURRENT, (it) => classifyLive(it.text, it.questionId, input));
    const byId = new Map(HELDOUT.map((it, i) => [it.id, results[i]]));
    return runEval("live", (it) => byId.get(it.id)!, HELDOUT, input.model);
  }),
});

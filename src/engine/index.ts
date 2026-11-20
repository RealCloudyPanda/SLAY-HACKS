import type { EngineResult } from "./contract";
import { cleanSampleEngine, type SampleEngine } from "./sample/classify";

export type { EngineResult } from "./contract";
export { createSampleEngine, cleanSampleEngine, TAU, DELTA, MIX, MIN_WORDS, W_CUE, W_SIM } from "./sample/classify";

/** Classify one report with a Sample engine instance (defaults to the clean, exemplar-free engine). */
export function classifySample(text: string, engine: SampleEngine = cleanSampleEngine): EngineResult {
  return engine.classify(text);
}

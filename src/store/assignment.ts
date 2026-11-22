import type { Assignment } from "@/domain/types";
import type { EngineResult } from "@/engine/contract";

export function toAssignment(r: EngineResult): Assignment {
  return {
    label: r.misconceptionId,
    evidenceExcerpt: r.evidenceExcerpt,
    confidence: r.confidence,
    candidates: r.candidates,
    engine: r.engine,
    source: "ai",
    reason: r.reason,
  };
}

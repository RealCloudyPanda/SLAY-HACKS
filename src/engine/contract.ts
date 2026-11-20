import { z } from "zod";
import { MISCONCEPTION_IDS, type EngineKind } from "@/domain/types";

export const MisconceptionIdEnum = z.enum(MISCONCEPTION_IDS);
export const LabelSchema = z.union([MisconceptionIdEnum, z.literal("abstain")]);
const CandidatesSchema = z.array(z.object({
  id: MisconceptionIdEnum,
  score: z.number().min(0).max(1),
})).max(2).refine((candidates) => new Set(candidates.map((candidate) => candidate.id)).size === candidates.length);

export const EngineResultSchema = z.object({
  misconceptionId: LabelSchema,
  evidenceExcerpt: z.string(),
  confidence: z.number().min(0).max(1),
  candidates: CandidatesSchema,
  engine: z.enum(["sample", "live"]),
  reason: z.string().optional(),
});
export type EngineResult = z.infer<typeof EngineResultSchema>;

/** Minimum confidence to accept a non-abstain result, per engine. */
export const CONFIDENCE_FLOOR: Record<EngineKind, number> = { sample: 0.05, live: 0.5 };

export function abstain(engine: EngineKind, reason: string, candidates: EngineResult["candidates"] = []): EngineResult {
  return { misconceptionId: "abstain", evidenceExcerpt: "", confidence: 0, candidates, engine, reason };
}

/**
 * The single gate every engine result passes through (ADR 0003).
 * Anything malformed, unknown, unquoted or under-confident becomes an abstain with a reason.
 */
export function validateResult(text: string, raw: unknown, engine: EngineKind): EngineResult {
  const parsed = EngineResultSchema.safeParse(raw);
  if (!parsed.success) {
    const maybe = raw as { candidates?: unknown } | null;
    const cands = CandidatesSchema.safeParse(maybe?.candidates);
    const id = (raw as { misconceptionId?: unknown } | null)?.misconceptionId;
    const unknownId = typeof id === "string" && !LabelSchema.safeParse(id).success;
    return abstain(
      engine,
      unknownId ? `Engine named a misconception that is not in the taxonomy` : "Engine output did not match the contract",
      cands.success ? cands.data : [],
    );
  }
  const r = { ...parsed.data, engine };
  if (r.misconceptionId === "abstain") return { ...r, evidenceExcerpt: "", reason: r.reason ?? "Engine was not sure" };

  const excerpt = r.evidenceExcerpt.trim();
  if (!excerpt || !text.includes(excerpt)) {
    return abstain(engine, "Evidence was not a word-for-word quote of the report", r.candidates);
  }
  if (r.confidence < CONFIDENCE_FLOOR[engine]) {
    return abstain(engine, `Confidence ${r.confidence.toFixed(2)} is below the ${CONFIDENCE_FLOOR[engine]} floor`, r.candidates);
  }
  return { ...r, evidenceExcerpt: excerpt };
}

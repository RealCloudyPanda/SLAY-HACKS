import { z } from "zod";
import { redact } from "@/domain/redact";
import { TAXONOMY } from "@/domain/taxonomy";
import { MISCONCEPTION_IDS, type QuestionId } from "@/domain/types";
import { abstain, validateResult, type EngineResult } from "../contract";

const ProviderUrl = z.url({ protocol: /^https$/, normalize: true }).max(300).refine((value) => {
  const url = URL.parse(value);
  if (!url || url.username || url.password || url.search || url.hash) return false;
  const configured = (process.env.LIVE_PROVIDER_ORIGINS ?? "").split(",").map((origin) => origin.trim());
  return url.origin === "https://api.openai.com" || configured.includes(url.origin);
}, "Use an approved HTTPS provider base URL without credentials, query, or fragment");

export const LiveConfigSchema = z.object({
  baseUrl: ProviderUrl,
  model: z.string().trim().min(1).max(120),
  apiKey: z.string().min(1).max(400),
});
export type LiveConfig = z.infer<typeof LiveConfigSchema>;

export const TIMEOUT_MS = 20_000;
export const MAX_CONCURRENT = 6;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["misconceptionId", "evidenceExcerpt", "confidence", "candidates", "reason"],
  properties: {
    misconceptionId: { type: "string", enum: [...MISCONCEPTION_IDS, "abstain"] },
    evidenceExcerpt: { type: "string" },
    confidence: { type: "number" },
    candidates: {
      type: "array",
      maxItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "score"],
        properties: { id: { type: "string", enum: [...MISCONCEPTION_IDS] }, score: { type: "number" } },
      },
    },
    reason: { type: "string" },
  },
};

const SYSTEM = [
  "You help a teaching assistant group students' one-sentence 'where I got stuck' reports about A* search.",
  "Assign each report to exactly one misconception id from this taxonomy, or 'abstain'.",
  ...TAXONOMY.map((t) => `- ${t.id}: ${t.defaultName}. The student believes ${t.definition}.`),
  "Rules: evidenceExcerpt must be copied word for word from the report (an exact substring).",
  "If the report is vague, or two misconceptions fit, return misconceptionId 'abstain' with an empty evidenceExcerpt.",
  "confidence is 0..1. candidates: your top two ids with scores 0..1. reason: one short sentence.",
  "Reply with JSON only.",
].join("\n");

type FetchFn = typeof fetch;


export async function classifyLive(
  text: string,
  questionId: QuestionId,
  cfg: LiveConfig,
  fetchFn: FetchFn = fetch,
): Promise<EngineResult> {
  const url = `${cfg.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const body = (format: object) =>
    JSON.stringify({
      model: cfg.model,
      temperature: 0,
      response_format: format,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Question: ${questionId}\nReport: ${text}` },
      ],
    });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const call = (format: object) => fetchFn(url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
    body: body(format),
    signal: controller.signal,
    cache: "no-store",
    redirect: "error",
  });
  try {
    let res = await call({ type: "json_schema", json_schema: { name: "stuck_report_label", strict: true, schema: SCHEMA } });
    if (res.status === 400) {
      await res.body?.cancel();
      res = await call({ type: "json_object" });
    }
    if (!res.ok) {
      await res.body?.cancel();
      return abstain("live", `Live engine error: ${res.status}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return abstain("live", "Live engine error: empty reply");
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return abstain("live", "Live engine error: reply was not JSON");
    }
    const p = parsed as Record<string, unknown>;
    if (p && typeof p === "object" && typeof p.reason === "string") {
      const reason = redact(p.reason.replaceAll(cfg.apiKey, "[redacted]").slice(0, 200));
      p.reason = reason ? `Model: ${reason}` : undefined;
    }
    return validateResult(text, { ...p, engine: "live" }, "live");
  } catch (e) {
    const timeout = (e as Error)?.name === "AbortError";
    return abstain("live", timeout ? "Live engine error: timed out" : "Live engine error: network");
  } finally {
    clearTimeout(timer);
  }
}

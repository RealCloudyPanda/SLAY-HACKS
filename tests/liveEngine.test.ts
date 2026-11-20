import { describe, expect, it, vi } from "vitest";
import { classifyLive, LiveConfigSchema, TIMEOUT_MS } from "@/engine/live/openaiCompatible";

const cfg = { baseUrl: "https://example.test/v1", model: "m", apiKey: "sk-SECRET-123" };
const text = "I stopped the search as soon as the goal was added to the open list";
const reply = (content: object, status = 200) =>
  new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status });
const good = {
  misconceptionId: "goal-test-on-generation",
  evidenceExcerpt: "as soon as the goal was added to the open list",
  confidence: 0.9,
  candidates: [{ id: "goal-test-on-generation", score: 0.9 }],
  reason: "",
};

describe("live engine (mocked fetch)", () => {
  it("validates a happy-path reply", async () => {
    const f = vi.fn(async () => reply(good));
    const r = await classifyLive(text, "Q2", cfg, f as unknown as typeof fetch);
    expect(r.misconceptionId).toBe("goal-test-on-generation");
    expect(r.engine).toBe("live");
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.test/v1/chat/completions");
    expect(init).toMatchObject({ cache: "no-store", redirect: "error" });
    expect(JSON.parse(init.body as string).response_format.type).toBe("json_schema");
  });
  it("retries with json_object after a 400", async () => {
    const f = vi.fn().mockResolvedValueOnce(new Response("bad", { status: 400 })).mockResolvedValueOnce(reply(good));
    const r = await classifyLive(text, "Q2", cfg, f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledTimes(2);
    expect(JSON.parse((f.mock.calls[1][1] as RequestInit).body as string).response_format).toEqual({ type: "json_object" });
    expect(r.misconceptionId).toBe("goal-test-on-generation");
  });
  it("HTTP error → abstain without leaking the key", async () => {
    const f = vi.fn(async () => new Response("nope", { status: 401 }));
    const r = await classifyLive(text, "Q2", cfg, f as unknown as typeof fetch);
    expect(r.misconceptionId).toBe("abstain");
    expect(r.reason).toBe("Live engine error: 401");
    expect(JSON.stringify(r)).not.toContain("SECRET");
  });
  it("network failure and timeout → abstain", async () => {
    const net = vi.fn(async () => {
      throw new TypeError("fetch failed sk-SECRET-123");
    });
    expect((await classifyLive(text, "Q2", cfg, net as unknown as typeof fetch)).reason).toBe("Live engine error: network");
    const abort = vi.fn(async () => {
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    });
    expect((await classifyLive(text, "Q2", cfg, abort as unknown as typeof fetch)).reason).toBe("Live engine error: timed out");
  });
  it("invented evidence → abstain via the shared validator", async () => {
    const f = vi.fn(async () => reply({ ...good, evidenceExcerpt: "student clearly misunderstands goal tests" }));
    const r = await classifyLive(text, "Q2", cfg, f as unknown as typeof fetch);
    expect(r.misconceptionId).toBe("abstain");
    expect(r.reason).toMatch(/word-for-word/);
  });
  it("accepts only approved HTTPS origins in procedure inputs", () => {
    vi.stubEnv("LIVE_PROVIDER_ORIGINS", "https://approved.example.test");
    try {
      const allows = (baseUrl: string) => LiveConfigSchema.safeParse({ ...cfg, baseUrl }).success;
      expect(allows("https://api.openai.com/v1")).toBe(true);
      expect(allows("https://approved.example.test/v1")).toBe(true);
      expect(allows("https://example.test/v1")).toBe(false);
      expect(allows("http://approved.example.test/v1")).toBe(false);
      expect(allows("https://approved.example.test/v1?test=1")).toBe(false);
      expect(allows("invalid")).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("times out when the provider returns headers without completing the body", async () => {
    vi.useFakeTimers();
    try {
      const pending = classifyLive(text, "Q2", cfg, async (_url, init) =>
        new Response(new ReadableStream({
          start(stream) {
            init?.signal?.addEventListener("abort", () => stream.error(init.signal?.reason));
          },
        })),
      );
      await vi.advanceTimersByTimeAsync(TIMEOUT_MS);
      await expect(pending).resolves.toMatchObject({ misconceptionId: "abstain", reason: "Live engine error: timed out" });
    } finally {
      vi.useRealTimers();
    }
  });
  it("redacts provider-supplied reasons before exposing them", async () => {
    const reason = `Mixed ideas. Contact demo@example.test. Key ${cfg.apiKey}`;
    const r = await classifyLive(text, "Q2", cfg, async () => reply({ ...good, reason }));
    expect(r.reason).toBe("Model: Mixed ideas. Contact [email]. Key [redacted]");
  });
});

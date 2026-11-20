import { describe, expect, it, vi } from "vitest";
import { classifyLive } from "@/engine/live/openaiCompatible";

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
});

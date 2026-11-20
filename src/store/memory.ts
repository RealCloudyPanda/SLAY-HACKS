import { SEED } from "@/data/seed";
import { redact } from "@/domain/redact";
import { defaultMisconceptions } from "@/domain/taxonomy";
import type { Assignment, Correction, Misconception, MisconceptionId, QuestionId, StuckReport } from "@/domain/types";
import type { EngineResult } from "@/engine/contract";
import { createSampleEngine, type Exemplars, type SampleEngine } from "@/engine/sample/classify";

const EXEMPLAR_MAX = 20;

interface State {
  reports: StuckReport[];
  misconceptions: Misconception[];
  corrections: Correction[];
  exemplars: Exemplars;
  engine: { kind: "sample" | "live"; model?: string };
  seq: number;
}

const g = globalThis as unknown as { __ohh?: State };

function toAssignment(r: EngineResult): Assignment {
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

function fresh(): State {
  const engine = createSampleEngine();
  const base = Date.parse("2026-11-19T15:00:00Z");
  return {
    reports: SEED.map((s, i) => ({
      id: s.id,
      questionId: s.questionId,
      text: s.text,
      createdAt: new Date(base + i * 7 * 60_000).toISOString(),
      assignment: toAssignment(engine.classify(s.text)),
    })),
    misconceptions: defaultMisconceptions(),
    corrections: [],
    exemplars: {},
    engine: { kind: "sample" },
    seq: 0,
  };
}

/** Lazily seeded singleton. In-memory and per server instance (see README Known limitations). */
export function state(): State {
  if (!g.__ohh) g.__ohh = fresh();
  return g.__ohh;
}

const nextId = (prefix: string) => `${prefix}${++state().seq}`;
const now = () => new Date().toISOString();

let engineCache: { key: string; engine: SampleEngine } | undefined;
/** Sample engine including TA exemplars (store-only; eval uses a clean engine). */
export function demoEngine(): SampleEngine {
  const key = JSON.stringify(state().exemplars);
  if (!engineCache || engineCache.key !== key) engineCache = { key, engine: createSampleEngine(state().exemplars) };
  return engineCache.engine;
}

function findReport(id: string): StuckReport {
  const r = state().reports.find((x) => x.id === id);
  if (!r) throw new Error("Report not found");
  return r;
}

function log(c: Omit<Correction, "id" | "at">) {
  state().corrections.unshift({ id: nextId("c"), at: now(), ...c });
}

function addExemplar(id: MisconceptionId, text: string) {
  const ex = state().exemplars;
  const list = (ex[id] ?? []).filter((t) => t !== text);
  list.push(text);
  ex[id] = list.slice(-EXEMPLAR_MAX);
}
function removeExemplar(text: string) {
  const ex = state().exemplars;
  for (const k of Object.keys(ex) as MisconceptionId[]) ex[k] = ex[k]!.filter((t) => t !== text);
}

export const store = {
  submit(questionId: QuestionId, text: string): StuckReport {
    const clean = redact(text);
    const report: StuckReport = {
      id: nextId("r"),
      questionId,
      text: clean,
      createdAt: now(),
      assignment: toAssignment(demoEngine().classify(clean)),
    };
    state().reports.push(report);
    return report;
  },

  confirm(reportId: string): StuckReport {
    const r = findReport(reportId);
    if (r.assignment.label === "abstain") throw new Error("Nothing to confirm: report has no misconception");
    r.assignment = { ...r.assignment, source: "ta-confirmed" };
    addExemplar(r.assignment.label as MisconceptionId, r.text);
    log({ kind: "confirm", reportId, to: r.assignment.label });
    return r;
  },

  move(reportId: string, to: MisconceptionId): StuckReport {
    const r = findReport(reportId);
    const from = r.assignment.label;
    removeExemplar(r.text);
    r.assignment = { ...r.assignment, label: to, source: "ta-moved", evidenceExcerpt: r.assignment.label === to ? r.assignment.evidenceExcerpt : "", reason: undefined };
    addExemplar(to, r.text);
    log({ kind: "move", reportId, from, to });
    return r;
  },

  reject(reportId: string): StuckReport {
    const r = findReport(reportId);
    const from = r.assignment.label;
    removeExemplar(r.text);
    r.assignment = { ...r.assignment, label: "abstain", source: "ta-rejected", evidenceExcerpt: "", reason: "A TA said this was not the right misconception" };
    log({ kind: "reject", reportId, from, to: "abstain" });
    return r;
  },

  rename(misconceptionId: MisconceptionId, name: string): Misconception {
    const m = state().misconceptions.find((x) => x.id === misconceptionId);
    if (!m) throw new Error("Misconception not found");
    const oldName = m.name;
    m.name = name.trim();
    log({ kind: "rename", misconceptionId, oldName, newName: m.name });
    return m;
  },

  /** Re-classify every report not touched by a TA. */
  async rerun(
    classify: (text: string) => EngineResult | Promise<EngineResult>,
    engine: State["engine"],
  ): Promise<{ processed: number; abstained: number; failed: number }> {
    const targets = state().reports.filter((r) => r.assignment.source === "ai");
    const results = await Promise.all(targets.map((r) => Promise.resolve(classify(r.text))));
    let abstained = 0;
    let failed = 0;
    targets.forEach((r, i) => {
      const res = results[i];
      if (res.misconceptionId === "abstain") abstained++;
      if (res.reason?.startsWith("Live engine error")) failed++;
      r.assignment = toAssignment(res);
    });
    state().engine = engine;
    return { processed: targets.length, abstained, failed };
  },

  reset() {
    g.__ohh = fresh();
    engineCache = undefined;
  },
};

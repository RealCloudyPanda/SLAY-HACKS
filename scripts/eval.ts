
import { execSync } from "node:child_process";
import { HELDOUT } from "../src/data/heldout";
import { cleanSampleEngine } from "../src/engine/sample/classify";
import { LABELS } from "../src/eval/metrics";
import { runEval } from "../src/eval/runEval";

const pct = (v: number | null) => (v === null ? "n/a" : `${(v * 100).toFixed(1)}%`);
let commit = "unknown";
try {
  commit = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
} catch {}

const r = await runEval("sample", (it) => cleanSampleEngine.classify(it.text), HELDOUT);
const m = r.metrics;
const c = m.counts;
console.log(`Office Hours Heatmap eval: engine=${r.engine} items=${r.size} commit=${commit} at=${r.ranAt}`);
console.log(`Authored synthetic challenge set, ${r.size} items: not independent validation.\n`);
console.table({
  "Overall agreement": { value: pct(m.overallAgreement), detail: `${c.correct}/${m.n}` },
  "Issued-label precision": { value: pct(m.issuedLabelPrecision), detail: `${c.issuedCorrect}/${c.issued}, includes ambiguous false positives` },
  "Clear-gold conditional accuracy": { value: pct(m.accuracyWhenAnswered), detail: `${c.answeredCorrect}/${c.answered}` },
  Coverage: { value: pct(m.coverage), detail: `${c.answered}/${c.goldNonAbstain}` },
  "Abstain rate": { value: pct(m.abstainRate), detail: `${c.abstained}/${m.n}` },
  "Ambiguous caught": { value: pct(m.ambiguousCaught), detail: `${Math.round((m.ambiguousCaught ?? 0) * c.goldAbstain)}/${c.goldAbstain}` },
  "Naive by-question baseline": { value: pct(r.baseline.overallAgreement), detail: "overall agreement" },
});
console.log("Thresholds:", JSON.stringify(r.thresholds));
console.log("\nConfusion (rows = gold, cols = predicted):");
const short = (l: string) => l.split("-")[0].slice(0, 6);
console.log(["gold \\ pred".padEnd(30), ...LABELS.map((l) => short(l).padStart(7))].join(""));
for (const g of LABELS) console.log([g.padEnd(30), ...LABELS.map((p) => String(r.confusion[g][p]).padStart(7))].join(""));
console.log(`\nMisses (${r.misses.length}):`);
for (const x of r.misses) console.log(`- ${x.id} [${x.questionId}] gold=${x.gold} predicted=${x.predicted}${x.reason ? ` (${x.reason})` : ""}\n    "${x.text}"`);

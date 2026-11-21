"use client";

import { ConfusionTable } from "./ConfusionTable";
import { MetricCard } from "./MetricCard";
import { questionLabel } from "@/domain/questions";
import type { EvalReport } from "@/eval/runEval";

export function EvalView({ r }: { r: EvalReport }) {
  const m = r.metrics;
  const c = m.counts;
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="totals">
        <span>Engine <b>{r.engine === "sample" ? "Sample" : `Live · ${r.model}`}</b></span>
        <span>Authored challenge items <b>{r.size}</b></span>
        <span>Ran at <b>{new Date(r.ranAt).toLocaleString()}</b></span>
      </div>
      <p className="note">Authored synthetic challenge cases, not independent validation or evidence of classroom effectiveness.</p>
      <div className="metrics">
        <MetricCard label="Overall agreement" value={m.overallAgreement} detail={`${c.correct} of ${m.n} match the gold label (abstain counts as a label)`} />
        <MetricCard label="Issued-label precision" value={m.issuedLabelPrecision} detail={`${c.issuedCorrect} of ${c.issued} issued labels correct, including labels issued on ambiguous reports`} />
        <MetricCard label="Clear-gold conditional accuracy" value={m.accuracyWhenAnswered} detail={`${c.answeredCorrect} of ${c.answered} correct among answered items with a clear gold label`} />
        <MetricCard label="Coverage" value={m.coverage} detail={`${c.answered} of ${c.goldNonAbstain} clear reports got a label`} />
        <MetricCard label="Abstain rate" value={m.abstainRate} detail={`${c.abstained} of ${m.n} sent to review`} />
        <MetricCard label="Ambiguous caught" value={m.ambiguousCaught} detail={`of ${c.goldAbstain} authored ambiguous reports`} />
        <MetricCard muted label="Naive by-question baseline" value={r.baseline.overallAgreement} detail="predict the most common misconception for that question number" />
      </div>
      <section className="stack" style={{ gap: 10 }}>
        <h2>Confusion table</h2>
        <ConfusionTable m={r.confusion} />
      </section>
      <section className="stack" style={{ gap: 4 }}>
        <h2>Every miss ({r.misses.length})</h2>
        {r.misses.length === 0 ? <p className="muted">No misses on this run.</p> : null}
        {r.misses.map((x) => (
          <div className="miss" key={x.id}>
            <p className="report-text">{x.text}</p>
            <div className="report-meta">
              <span className="qtag">{questionLabel(x.questionId)}</span>
              <span>gold <b>{x.gold}</b></span>
              <span>predicted <b className="reason">{x.predicted}</b></span>
              {x.reason ? <span>({x.reason})</span> : null}
            </div>
          </div>
        ))}
      </section>
      <p className="small muted">
        Thresholds: <span className="mono">{Object.entries(r.thresholds).map(([k, v]) => `${k}=${v}`).join("  ")}</span>
      </p>
    </div>
  );
}

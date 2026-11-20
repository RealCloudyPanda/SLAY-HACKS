"use client";

import { questionLabel } from "@/domain/questions";
import type { MisconceptionId, StuckReport } from "@/domain/types";
import { ConfidenceBar } from "./ConfidenceBar";
import { EvidenceText } from "./EvidenceText";
import { MoveMenu } from "./MoveMenu";

const SOURCE: Record<StuckReport["assignment"]["source"], { text: string; ta: boolean }> = {
  ai: { text: "AI", ta: false },
  "ta-confirmed": { text: "TA confirmed", ta: true },
  "ta-moved": { text: "TA moved", ta: true },
  "ta-rejected": { text: "TA rejected", ta: true },
};

export function ReportCard({
  report,
  options,
  onConfirm,
  onMove,
  onReject,
  busy,
}: {
  report: StuckReport;
  options: { id: MisconceptionId; name: string }[];
  onConfirm: () => void;
  onMove: (to: MisconceptionId) => void;
  onReject: () => void;
  busy?: boolean;
}) {
  const a = report.assignment;
  const src = SOURCE[a.source];
  return (
    <li className="report" id={`r-${report.id}`}>
      <div className="stack" style={{ gap: 8 }}>
        <EvidenceText text={report.text} excerpt={a.evidenceExcerpt} />
        <div className="report-meta">
          <span className="qtag" title={questionLabel(report.questionId)}>{questionLabel(report.questionId)}</span>
          {a.source === "ai" || a.evidenceExcerpt ? <ConfidenceBar value={a.confidence} /> : null}
          <span className={`src ${src.ta ? "src-ta" : "src-ai"}`}>{src.text}</span>
          {a.engine === "live" && a.source === "ai" ? <span className="src src-ai">live model</span> : null}
        </div>
      </div>
      <div className="report-actions">
        {a.source !== "ta-confirmed" ? (
          <button className="btn btn-sm" onClick={onConfirm} disabled={busy}>Confirm</button>
        ) : null}
        <MoveMenu options={options} exclude={a.label} onPick={onMove} disabled={busy} />
        <button className="btn btn-quiet btn-sm" onClick={onReject} disabled={busy}>Not this</button>
      </div>
    </li>
  );
}

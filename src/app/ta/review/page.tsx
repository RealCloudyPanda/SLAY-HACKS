"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/EmptyState";
import { MoveMenu } from "@/components/MoveMenu";
import { questionLabel } from "@/domain/questions";
import { useInvalidateAll } from "@/lib/useInvalidate";
import { useTRPC } from "@/trpc/client";

export default function ReviewPage() {
  const trpc = useTRPC();
  const invalidate = useInvalidateAll();
  const q = useQuery(trpc.review.list.queryOptions());
  const move = useMutation(trpc.correction.move.mutationOptions({ onSuccess: () => invalidate() }));

  if (!q.data) return <p className="muted">{q.error ? q.error.message : "Loading…"}</p>;
  const { reports, misconceptions } = q.data;
  const nameOf = (id: string) => misconceptions.find((m) => m.id === id)?.name ?? id;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1>Review queue</h1>
        <p className="muted" style={{ maxWidth: "70ch" }}>
          Reports wait here when they are vague, mix ideas, lack A* context, or may describe a correction rather than a misconception.
          Read the full report before assigning. A correct or off-topic statement may fit none of these six labels; keep it unassigned.
          Any engine guesses shown are hints, not answers.
        </p>
      </div>
      {reports.length === 0 ? (
        <div className="panel">
          <EmptyState title="No reports waiting for review." />
        </div>
      ) : (
        <ul className="reports">
          {reports.map((r) => (
            <li className="report" key={r.id}>
              <div className="stack" style={{ gap: 8 }}>
                <p className="report-text">{r.text}</p>
                <div className="report-meta">
                  <span className="qtag">{questionLabel(r.questionId)}</span>
                  <span className="reason">{r.assignment.reason ?? "Engine was not sure"}</span>
                  {r.assignment.source === "ta-rejected" ? <span className="src src-ta">TA rejected</span> : null}
                </div>
              </div>
              <div className="report-actions">
                {r.assignment.candidates.filter((c) => c.score >= 0.1).length === 0 ? (
                  <span className="small muted" style={{ alignSelf: "center" }}>No label suggestion</span>
                ) : null}
                {r.assignment.candidates.filter((c) => c.score >= 0.1).map((c) => (
                  <button
                    key={c.id}
                    className="btn btn-sm"
                    disabled={move.isPending}
                    onClick={() => move.mutate({ reportId: r.id, to: c.id })}
                    title={`Engine score ${c.score.toFixed(2)}`}
                  >
                    Assign to {nameOf(c.id)}
                    <span className="num muted">{c.score.toFixed(2)}</span>
                  </button>
                ))}
                <MoveMenu options={misconceptions} onPick={(to) => move.mutate({ reportId: r.id, to })} label="Move to…" disabled={move.isPending} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

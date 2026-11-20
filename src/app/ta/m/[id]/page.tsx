"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { RenameField } from "@/components/RenameField";
import { ReportCard } from "@/components/ReportCard";
import { questionLabel } from "@/domain/questions";
import { isMisconceptionId } from "@/domain/types";
import { useInvalidateAll } from "@/lib/useInvalidate";
import { useTRPC } from "@/trpc/client";

export default function ClusterPage() {
  const { id } = useParams<{ id: string }>();
  if (!isMisconceptionId(id)) notFound();
  const trpc = useTRPC();
  const invalidate = useInvalidateAll();
  const q = useQuery(trpc.cluster.byId.queryOptions({ id }));
  const opts = { onSuccess: () => invalidate() };
  const confirm = useMutation(trpc.correction.confirm.mutationOptions(opts));
  const move = useMutation(trpc.correction.move.mutationOptions(opts));
  const reject = useMutation(trpc.correction.reject.mutationOptions(opts));
  const rename = useMutation(trpc.correction.rename.mutationOptions(opts));
  const busy = confirm.isPending || move.isPending || reject.isPending;

  if (!q.data) return <p className="muted">{q.error ? q.error.message : "Loading…"}</p>;
  const { misconception: m, reports, countsByQuestion, all } = q.data;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <Link href="/ta" className="small muted">
        ← Teach-first list
      </Link>
      <header className="cluster-head">
        <RenameField
          key={m.name}
          name={m.name}
          defaultName={m.defaultName}
          saving={rename.isPending}
          onSave={(name) => rename.mutate({ misconceptionId: m.id, name })}
        />
        <p className="muted" style={{ maxWidth: "75ch" }}>
          Students believe {m.definition}.
        </p>
        <div className="say">
          <b>What to say</b>
          {m.teachingHint}
        </div>
        <div className="qcounts" aria-label="Reports by question">
          <span className="small muted" style={{ alignSelf: "center" }}>
            <span className="num" style={{ color: "var(--ink)", fontWeight: 600 }}>{reports.length}</span> reports:
          </span>
          {countsByQuestion.map((c) => (
            <span key={c.questionId} id={c.questionId} className={`qcount ${c.count === 0 ? "zero" : ""}`}>
              <span className="mono">{questionLabel(c.questionId)}</span>
              <span className="num">{c.count}</span>
            </span>
          ))}
        </div>
      </header>

      {reports.length === 0 ? (
        <EmptyState title="No reports in this misconception">
          Move reports here from the <Link href="/ta/review">review queue</Link> or another misconception.
        </EmptyState>
      ) : (
        <ul className="reports">
          {reports.map((r) => (
            <ReportCard
              key={`${r.id}-${r.assignment.source}`}
              report={r}
              options={all}
              busy={busy}
              onConfirm={() => confirm.mutate({ reportId: r.id })}
              onMove={(to) => move.mutate({ reportId: r.id, to })}
              onReject={() => reject.mutate({ reportId: r.id })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

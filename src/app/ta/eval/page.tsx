"use client";

import { useQuery } from "@tanstack/react-query";
import { EvalLiveButton } from "@/components/EvalLiveButton";
import { EvalView } from "@/components/EvalView";
import { useTRPC } from "@/trpc/client";

export default function EvalPage() {
  const trpc = useTRPC();
  const q = useQuery({ ...trpc.eval.run.queryOptions(), staleTime: 0 });
  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="spread">
        <div className="stack" style={{ gap: 6 }}>
          <h1>Does the engine get it right?</h1>
          <p className="muted" style={{ maxWidth: "70ch" }}>
            Measured on a held-out set the engine was never tuned on. Same numbers as <span className="mono">npm run eval</span>.
          </p>
        </div>
        <div className="toolbar">
          <button className="btn btn-sm" onClick={() => q.refetch()} disabled={q.isFetching}>
            {q.isFetching ? "Running…" : "Run again"}
          </button>
          <EvalLiveButton />
        </div>
      </div>
      <p className="note">Synthetic held-out set, 20 items: small, indicative only. One item is 5 percentage points.</p>
      {q.data ? <EvalView r={q.data} /> : <p className="muted">{q.error ? q.error.message : "Running evaluation…"}</p>}
    </div>
  );
}

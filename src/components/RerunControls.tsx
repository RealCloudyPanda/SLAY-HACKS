"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useLiveConfig } from "@/lib/liveConfig";
import { useInvalidateAll } from "@/lib/useInvalidate";
import { useTRPC } from "@/trpc/client";

/** "Re-run with live model" appears only when a live model is configured in this browser. */
export function RerunControls() {
  const trpc = useTRPC();
  const invalidate = useInvalidateAll();
  const { config, isLiveReady } = useLiveConfig();
  const summary = useQuery(trpc.dashboard.summary.queryOptions());
  const rerun = useMutation(trpc.engine.rerun.mutationOptions({ onSuccess: () => invalidate() }));
  const onLive = summary.data?.engine.kind === "live";
  const r = rerun.data;

  return (
    <>
      {isLiveReady ? (
        <button
          className="btn btn-sm btn-pencil"
          disabled={rerun.isPending}
          onClick={() => rerun.mutate({ engine: "live", baseUrl: config.baseUrl, model: config.model, apiKey: config.apiKey })}
        >
          {rerun.isPending ? "Re-running…" : "Re-run with live model"}
        </button>
      ) : null}
      {onLive ? (
        <button className="btn btn-sm" disabled={rerun.isPending} onClick={() => rerun.mutate({ engine: "sample" })}>
          Re-run with Sample engine
        </button>
      ) : null}
      {r && r.failed > 0 ? (
        <div className="banner banner-warn" role="status" style={{ width: "100%" }}>
          {r.failed} of {r.processed} reports could not be classified by the live model and went to review. Sample results are one
          click away: Re-run with Sample engine.
        </div>
      ) : r ? (
        <span className="small muted" role="status">
          Re-classified {r.processed} reports ({r.abstained} sent to review). TA-corrected reports were left alone.
        </span>
      ) : null}
    </>
  );
}

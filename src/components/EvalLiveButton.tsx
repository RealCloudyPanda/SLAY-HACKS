"use client";

import { useMutation } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useLiveConfig } from "@/lib/liveConfig";
import { useTRPC } from "@/trpc/client";
import { EvalView } from "./EvalView";

/** Shown only when a live model is configured: evaluates it on the same held-out set. */
export function EvalLiveButton() {
  const trpc = useTRPC();
  const { config, isLiveReady } = useLiveConfig();
  const run = useMutation(trpc.eval.runLive.mutationOptions());
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setSlot(document.getElementById("live-eval-slot")), []);
  if (!isLiveReady) return null;
  return (
    <>
      <button
        className="btn btn-sm btn-pencil"
        disabled={run.isPending}
        onClick={() => run.mutate({ baseUrl: config.baseUrl, model: config.model, apiKey: config.apiKey })}
      >
        {run.isPending ? "Evaluating live…" : "Evaluate live engine"}
      </button>
      {slot && (run.data || run.error)
        ? createPortal(
            <section className="stack panel panel-body" style={{ gap: 12 }}>
              <h2>Live engine on the held-out set</h2>
              {run.data ? <EvalView r={run.data} /> : <p className="reason">Live evaluation failed: {run.error?.message.slice(0, 160)}</p>}
            </section>,
            slot,
          )
        : null}
    </>
  );
}

"use client";

import { useLiveConfig } from "@/lib/liveConfig";

/** Shows which engine produced the labels on screen; Sample is the offline default. */
export function EngineBadge({ serverEngine }: { serverEngine?: { kind: "sample" | "live"; model?: string } }) {
  const { isLiveReady, config } = useLiveConfig();
  const live = serverEngine?.kind === "live";
  return (
    <span
      className={`tag ${live ? "engine-live" : "engine-sample"}`}
      title={live ? "Labels on screen came from your live model" : "Deterministic offline engine. No key, no network."}
    >
      <span className="tag-dot" aria-hidden />
      {live ? `Live engine · ${serverEngine?.model ?? config.model}` : "Sample engine · offline"}
      {!live && isLiveReady ? <span className="sr-only">(live model configured)</span> : null}
    </span>
  );
}

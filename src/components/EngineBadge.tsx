"use client";

import { useLiveConfig } from "@/lib/liveConfig";


export function EngineBadge({ serverEngine }: { serverEngine?: { kind: "sample" | "live"; model?: string } }) {
  const { isLiveReady, config } = useLiveConfig();
  const live = serverEngine?.kind === "live";
  return (
    <span
      className={`tag ${live ? "engine-live" : "engine-sample"}`}
      title={live ? "The most recent batch used a live model. New submissions use the Sample engine." : "Deterministic offline engine. No key, no network."}
    >
      <span className="tag-dot" aria-hidden />
      {live ? `Last live run · ${serverEngine?.model ?? config.model}` : "Sample engine · offline"}
      {!live && isLiveReady ? <span className="sr-only">(live model configured)</span> : null}
    </span>
  );
}

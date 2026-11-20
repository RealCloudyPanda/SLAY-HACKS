"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface LiveConfig {
  engine: "sample" | "live";
  baseUrl: string;
  model: string;
  apiKey: string;
}

const KEY = "ohh.liveConfig";
export const DEFAULT_LIVE: LiveConfig = { engine: "sample", baseUrl: "https://api.openai.com/v1", model: "", apiKey: "" };
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: LiveConfig } | undefined;

function read(): LiveConfig {
  const raw = typeof window === "undefined" ? null : window.localStorage.getItem(KEY);
  if (cache && cache.raw === raw) return cache.value;
  let value = DEFAULT_LIVE;
  try {
    if (raw) value = { ...DEFAULT_LIVE, ...JSON.parse(raw) };
  } catch {}
  cache = { raw, value };
  return value;
}

/** Live config lives only in this browser's localStorage (ADR 0004). */
export function useLiveConfig() {
  const config = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => DEFAULT_LIVE,
  );
  const save = useCallback((next: LiveConfig) => {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  }, []);
  const forget = useCallback(() => {
    window.localStorage.removeItem(KEY);
    listeners.forEach((l) => l());
  }, []);
  const isLiveReady = config.engine === "live" && !!config.apiKey && !!config.model && !!config.baseUrl;
  return { config, save, forget, isLiveReady };
}

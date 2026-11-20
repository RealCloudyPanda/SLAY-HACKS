"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DEFAULT_LIVE, useLiveConfig, type LiveConfig } from "@/lib/liveConfig";
import { useTRPC } from "@/trpc/client";

export default function SettingsPage() {
  const trpc = useTRPC();
  const { config, save, forget } = useLiveConfig();
  const [draft, setDraft] = useState<LiveConfig>(config);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(config), [config]);
  const test = useMutation(trpc.engine.test.mutationOptions());
  const set = (patch: Partial<LiveConfig>) => {
    setSaved(false);
    setDraft((d) => ({ ...d, ...patch }));
  };
  const liveFieldsOk = !!draft.baseUrl && !!draft.model && !!draft.apiKey;

  return (
    <div className="settings">
      <div className="stack" style={{ gap: 6 }}>
        <h1>Engine settings</h1>
        <p className="muted">The Sample engine runs offline with no key. A live model is optional.</p>
      </div>
      <form
        className="stack"
        style={{ gap: 20 }}
        onSubmit={(e) => {
          e.preventDefault();
          save(draft);
          setSaved(true);
        }}
      >
        <fieldset className="radio-row" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 500, marginBottom: 8 }}>Engine</legend>
          <label className="radio-card">
            <input type="radio" name="engine" checked={draft.engine === "sample"} onChange={() => set({ engine: "sample" })} />
            <span>
              <b>Sample engine</b> <span className="muted">· offline, deterministic</span>
              <span className="small muted" style={{ display: "block" }}>
                Cue patterns plus TF-IDF similarity, with an abstain rule. Same input, same output, every time.
              </span>
            </span>
          </label>
          <label className="radio-card">
            <input type="radio" name="engine" checked={draft.engine === "live"} onChange={() => set({ engine: "live" })} />
            <span>
              <b>Live engine</b> <span className="muted">· approved OpenAI-compatible provider</span>
              <span className="small muted" style={{ display: "block" }}>
                Uses your own key. Output passes the same validator: evidence must be a word-for-word quote.
              </span>
            </span>
          </label>
        </fieldset>

        {draft.engine === "live" ? (
          <div className="stack">
            <div className="field">
              <label htmlFor="base">Base URL</label>
              <input id="base" className="input mono" value={draft.baseUrl} onChange={(e) => set({ baseUrl: e.target.value })} placeholder={DEFAULT_LIVE.baseUrl} />
            </div>
            <div className="field">
              <label htmlFor="model">Model</label>
              <input id="model" className="input mono" value={draft.model} onChange={(e) => set({ model: e.target.value })} placeholder="model name" />
            </div>
            <div className="field">
              <label htmlFor="key">API key</label>
              <div className="row" style={{ flexWrap: "nowrap" }}>
                <input
                  id="key"
                  className="input mono"
                  type={show ? "text" : "password"}
                  autoComplete="off"
                  value={draft.apiKey}
                  onChange={(e) => set({ apiKey: e.target.value })}
                />
                <button type="button" className="btn btn-sm" onClick={() => setShow((s) => !s)} aria-pressed={show}>
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <p className="note">
              OpenAI is enabled by default. Other HTTPS provider origins require server configuration. The browser
              saves your API key in localStorage and sends it through the demo server to the selected provider.
              Live reruns send redacted report text and question IDs. Use synthetic data only.
            </p>
            <div className="row">
              <button
                type="button"
                className="btn btn-sm"
                disabled={!liveFieldsOk || test.isPending}
                onClick={() => test.mutate({ baseUrl: draft.baseUrl, model: draft.model, apiKey: draft.apiKey })}
              >
                {test.isPending ? "Testing…" : "Test connection"}
              </button>
              {test.data ? (
                <span className={`small ${test.data.ok ? "ok-text" : "reason"}`} role="status">
                  {test.data.message}
                </span>
              ) : null}
              {test.error ? <span className="small reason" role="status">Check the base URL and model: {test.error.message.slice(0, 120)}</span> : null}
            </div>
          </div>
        ) : null}

        <div className="row">
          <button type="submit" className="btn btn-primary" disabled={draft.engine === "live" && !liveFieldsOk}>
            Save
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              forget();
              setDraft(DEFAULT_LIVE);
              setSaved(false);
            }}
          >
            Forget key
          </button>
          {saved ? <span className="small ok-text" role="status">Saved in this browser.</span> : null}
        </div>
      </form>
    </div>
  );
}

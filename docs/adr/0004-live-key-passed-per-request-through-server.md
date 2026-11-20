# 0004: Live-engine key is sent per request through our server, never stored there

Status: accepted (2026-11-20)

The TA's API key lives in localStorage and is sent inside each tRPC "re-run with live model" call; the server
forwards it to the OpenAI-compatible endpoint and drops it. This avoids per-provider browser CORS rules at the
cost of the key transiting our process, so the server must never log, persist or echo request inputs for that
procedure. A browser-direct design would need a different client and threat model.

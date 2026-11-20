# 0002: A deterministic lexical engine is the default; no embedding model

Status: accepted (2026-11-20)

The default Sample engine is hand-built (cue patterns plus TF-IDF similarity to definitions and exemplars)
rather than an in-browser embedding model (transformers.js) or an LLM. It runs offline with no key and gives
identical output every run, so eval numbers are reproducible; the cost is weaker handling of unseen phrasings,
which the abstain rule and the optional Live engine absorb. Swapping it later is cheap at the code level, but
the published eval numbers and demo script depend on it.

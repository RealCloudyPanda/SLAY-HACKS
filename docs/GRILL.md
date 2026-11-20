# Grill log: Office Hours Heatmap

Method: grill-with-docs (grilling + domain modeling), run as a self-interview because the owner is
asleep. The owner's standing instruction is "accept the recommended answer", so every ✅ equals the ➡️.
Terms in **bold** are defined in [`GLOSSARY.md`](../GLOSSARY.md). Hard-to-reverse decisions are in
[`docs/adr/`](adr/).

---

## Round 1: Problem and user

**Q1. Who is the one user whose painful task we fix?**
➡️ A TA (or instructor) of an intro-AI course who runs office hours or a review session for 40 to 200
students and has about 10 minutes of attention to decide what to explain at the whiteboard.
✅ Decided. The student is a secondary user whose job is to report where they got stuck in under 30 seconds.

**Q2. What exactly is the painful task?**
➡️ Answering "What should I explain first?" Today the TA scrolls a forum, a form spreadsheet, or a pile of
regrade requests, and groups them in their head by homework question number. Question number is the
wrong axis: one confusion (for example "A* stops when it *generates* the goal") shows up in several
questions, and one question collects several unrelated confusions.
✅ Decided. This "wrong axis" claim is the core insight and must be shown on screen (the **Compare view**).

**Q3. What does a student submit?**
➡️ One sentence, 10 to 280 characters, plus an optional homework question tag (Q1 to Q5 or "Not sure").
No name, no email, no account.
✅ Decided. Short input keeps it honest (one stuck point per report) and keeps classification tractable.

**Q4. Is it real-time?**
➡️ No live sockets. The TA dashboard refetches on focus and has a refresh button. Office-hours prep is a
batch task that happens 10 minutes before the session.
✅ Decided.

**Q5. What does the student see after submitting?**
➡️ A plain confirmation ("Your TA will see this anonymously, grouped with similar ones"). The student does
**not** see the AI's label. Labelling a student's misunderstanding back to them, from a model that can be
wrong, is a harm we avoid by design.
✅ Decided.

**Q6. Anonymity and privacy?**
➡️ No identity fields, no IP or user-agent stored. A redaction pass replaces emails, student-number-like
digit runs (7+ digits) and "my name is X" phrases with `[redacted]` before the text is stored. The submit
form says "Don't include your name."
✅ Decided.

## Round 2: Domain model

**Q7. Do we discover clusters (unsupervised) or assign to a known list?**
➡️ Assign to a TA-owned **Taxonomy** of **Misconceptions** for the unit. The AI never invents a cluster.
Anything that doesn't fit goes to the **Review queue**. Reasons: the TA must recognise every group
instantly, assignment can be evaluated against gold labels, and the Sample engine can stay deterministic.
✅ Decided. See [ADR 0001](adr/0001-fixed-taxonomy-not-discovered-clusters.md).

**Q8. Can a report carry more than one misconception?**
➡️ No, one label per **Stuck report** in v1. When two misconceptions score nearly the same, the engine
**abstains** and the TA decides.
✅ Decided.

**Q9. What does "abstain" mean concretely?**
➡️ The engine returns `"abstain"` instead of a misconception id when (a) the top score is below a threshold,
(b) the top two scores are too close, (c) the text is too short to judge, or (d) a live model's output fails
validation. Abstained reports land in the Review queue with the engine's top-2 guesses shown as hints.
✅ Decided. See [ADR 0003](adr/0003-abstain-and-verbatim-evidence-invariant.md).

**Q10. What is the evidence for an assignment?**
➡️ An **Evidence excerpt**: a verbatim substring of the student's sentence (the clause that drove the
decision). It is highlighted inside the full sentence. If an engine returns an excerpt that is not a
verbatim substring, the result becomes an abstain. No paraphrased "evidence".
✅ Decided.

**Q11. Which corrections can the TA make?**
➡️ Four, all first-class and logged in the **Correction log**:
1. **Confirm** an AI assignment (marks it TA-confirmed).
2. **Move** a report to another misconception (or out of the review queue into one).
3. **Reject** ("Not this"): sends the report to the Review queue.
4. **Rename** a misconception's display name (the id stays stable).
Corrected reports are never overwritten by a later re-run of any engine.
✅ Decided.

**Q12. Do corrections change future AI behaviour?**
➡️ Yes, in a bounded and visible way: a moved or confirmed report becomes an **Exemplar** for its
misconception, and the Sample engine's similarity step compares new reports against exemplars. The demo
shows a similar new submission landing correctly after a TA move. This is cuttable if time runs short
(PLAN task marked "cuttable").
✅ Decided.

**Q13. How is "Teach this first" ranked?**
➡️ By number of stuck reports assigned to the misconception (AI-assigned plus TA-confirmed/moved),
tie-broken by number of distinct homework questions it appears in, then by TA-confirmed count. Each row
shows its reason: "14 reports across Q2, Q4, Q5". No opaque weighted score.
✅ Decided.

**Q14. What is the "heatmap"?**
➡️ A grid: rows are misconceptions (in ranked order), columns are homework questions (Q1 to Q5 plus
"Not sure"), each cell is a count with a single-hue sequential fill. Clicking a row opens the cluster.
✅ Decided.

**Q15. Demo topic and data?**
➡️ Intro-AI heuristic search (A*). Six misconceptions, five synthetic homework questions written by us,
60 synthetic stuck reports (dev/seed set) and 20 held-out synthetic reports (eval only). No real student
data, no copied course materials. Every screen that shows data says "Synthetic demo data".
✅ Decided. Details in [`SPEC.md`](SPEC.md#5-taxonomy-and-synthetic-data).

## Round 3: AI engines

**Q16. Which engine is the default?**
➡️ The **Sample engine**: a deterministic local classifier (normalisation, weighted cue patterns per
misconception, TF-IDF cosine similarity against misconception definitions and exemplars, then an abstain
rule). Works offline, needs no key, gives the same answer every run, so the eval numbers are reproducible.
✅ Decided. See [ADR 0002](adr/0002-deterministic-sample-engine-as-default.md).

**Q17. Do we run an embedding model in the browser with transformers.js?**
➡️ No, not in v1. The smallest useful sentence-embedding model still has to be downloaded from the
Hugging Face hub on first run (breaks "offline Sample mode"), and the package pulls `onnxruntime-node` and
`sharp` into a Next.js build. The gain over TF-IDF on 280-character sentences in a fixed taxonomy is not
worth the demo risk. Listed as a stretch idea in README.
✅ Decided.

**Q18. What is the optional live engine?**
➡️ The **Live engine**: an OpenAI-compatible Chat Completions endpoint (base URL, model, key typed into
Settings, stored in `localStorage` only). Works with any provider that speaks that format. Uses a JSON
schema response format. The TA triggers "Re-run with live model" over all non-corrected reports; student
submissions are always classified by the Sample engine first so the student page never needs a key.
✅ Decided.

**Q19. Does the key go through our server?**
➡️ Yes, per request only: the browser sends `{baseUrl, model, apiKey}` inside the tRPC mutation input, the
server calls the provider and returns the parsed result. The key is never stored server-side, never logged,
never put in a URL. This avoids provider CORS differences. Disclosed in Settings and README.
✅ Decided.

**Q20. Chrome built-in Prompt API (Gemini Nano)?**
➡️ Out of scope for v1. Availability depends on browser version, flags and a large model download; judges on
other browsers would see nothing. Mention as future work only.
✅ Decided.

**Q21. What is the shared output contract?**
➡️ Every engine returns, per report:
`{ misconceptionId: MisconceptionId | "abstain", evidenceExcerpt: string, confidence: number (0..1),
candidates: [{ id, score }] (top 2), engine: "sample" | "live", reason?: string }`. Validated with zod.
Same validator for every engine.
✅ Decided.

**Q22. How do we evaluate honestly?**
➡️ A held-out set of 20 synthetic reports (16 with a gold misconception, 4 deliberately ambiguous with gold
`abstain`), written in one commit **before** classifier tuning and phrased with different vocabulary from the
seed set. Thresholds are tuned on the 60 seed reports only. The eval page and `npm run eval` run the engine
live and print: overall agreement, accuracy-when-answered, coverage, abstain rate, ambiguous-caught rate,
and the naive by-question baseline. The first frozen result is recorded in README as-is, even if it is bad.
No number appears anywhere unless a run produced it.
✅ Decided.

**Q23. What if the held-out result is poor?**
➡️ Report it. If cues are changed after seeing held-out failures, README must say so and show both the
frozen and the post-change numbers. Honesty beats a pretty number for "Responsible AI".
✅ Decided.

## Round 4: Tech

**Q24. Stack?**
➡️ Next.js 16 (App Router) + tRPC v11 with `@trpc/tanstack-react-query` + TanStack Query v5 + zod 4,
TypeScript, plain CSS (CSS variables + CSS Modules, no Tailwind), Vitest for tests, `tsx` for the eval
script. Fonts from the `geist` npm package (bundled locally, no network fetch at build).
✅ Decided.

**Q25. TypeScript version?**
➡️ Pin `typescript@^6.0.3`. `latest` is 7.0.2 (the native port). Next's build-time type check relies on
the TS JS API, so 7.x is an avoidable risk for a hackathon. If `create-next-app` installs 7.x, downgrade.
✅ Decided.

**Q26. Where does state live?**
➡️ A server-side in-memory store (module singleton on `globalThis` so dev hot-reload keeps it). Seeded with
the 60 synthetic reports on first access. "Reset demo" reseeds. No database, no files written at runtime.
✅ Decided. Caveat: on serverless hosting each instance has its own memory; README "Known limitations".

**Q27. Auth for the TA view?**
➡️ None (prototype). `/ta` is a separate route group with its own layout. README states that a real
deployment needs course SSO and per-course isolation.
✅ Decided.

**Q28. Tests?**
➡️ Vitest unit tests for: redaction, normaliser, Sample engine on a handful of fixed sentences, contract
validator (rejects non-verbatim evidence), ranking, heatmap aggregation, the compare claim (by-question top
differs from by-misconception top on the seed gold labels), store corrections, and metrics maths.
✅ Decided.

## Round 5: Judging, demo, design

**Q29. What is the single demo moment?**
➡️ On `/ta/compare`, the left column ("Grouped by question number") says *teach Q4 first*; the right column
("Grouped by misconception") says *teach "Goal test on generation" first*, and shows it spans Q2, Q4 and Q5.
Second moment: an ambiguous report is abstained, the TA moves it with one click, the count updates and the
correction appears in the log.
✅ Decided.

**Q30. Visual direction?**
➡️ "Marked-up answer sheet": warm paper background, near-black ink text, one red-pencil accent used only
for heat and highlights (evidence `<mark>`), a tabular monospace for counts. Operate mode (dashboard tool):
precision and restraint, left-aligned, dense but calm. No gradients, no emoji headers, no purple.
✅ Decided. Tokens in `SPEC.md` section 9.

**Q31. Do we deploy?**
➡️ Optional. The repo must run locally with `npm install && npm run dev`. If the coordinator deploys to a
free host, state is per instance (documented). The video is the guaranteed demo.
✅ Decided.

**Q32. Which rubric lines do we optimise first?**
➡️ Innovation (misconception axis instead of question axis, abstain-by-default) and Technical
(typed tRPC contract, deterministic engine, measured eval), then Real-world impact (TA's 10 minutes),
then Responsible AI (evidence, abstain, corrections, privacy, honest eval), then UX/presentation.
✅ Decided. Scorecard in `SPEC.md` section 10.

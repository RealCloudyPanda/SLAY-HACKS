# Spec: Office Hours Heatmap

> Tell your TA where you got stuck in one sentence. The TA sees which **misconception** to explain first,
> not which question number got the most complaints.

Hackathon: SLAY HACKS 2026 (deadline 2026-12-07 17:00 ET). Prototype, synthetic data only.
Vocabulary follows [`GLOSSARY.md`](../GLOSSARY.md). Decisions and their reasons: [`GRILL.md`](GRILL.md),
[`adr/`](adr/). Stack facts: [`RESEARCH.md`](RESEARCH.md).

---

## 1. Users and the problem

| User | Job | Time budget |
|---|---|---|
| **TA** (primary) | Before office hours, decide what to explain first at the whiteboard. | 10 minutes |
| **Student** (secondary) | Say where they got stuck without being identified. | 30 seconds |

Painful task today: the TA reads a pile of free-text notes and mentally groups them by homework question
number. One misconception spreads across several questions, and one question mixes several misconceptions,
so the by-question view points at the wrong first explanation.

## 2. Core flows

**F1. Student reports.** `/submit` → pick homework question (Q1 to Q5 or "Not sure") → write one sentence
(10 to 280 chars) → Submit → confirmation. The text is redacted (emails, 7+ digit runs, "my name is X")
then stored and classified by the Sample engine. The student never sees the assignment.

**F2. TA picks what to teach.** `/ta` → teach-first list (ranked misconceptions with reasons) + heatmap
(misconceptions × questions) → click the top misconception → `/ta/m/[id]` shows every stuck report in it with
the evidence excerpt highlighted and a heuristic match-support bar.

**F3. TA corrects.** On a cluster page or in the review queue: Confirm, Move to…, Not this (reject → review
queue), or rename the misconception inline. Every correction updates counts immediately and is appended to
the correction log. Corrected reports are never re-assigned by any engine re-run.

**F4. TA resolves abstains.** `/ta/review` lists abstained and rejected reports with the engine's top-2 guesses
as hints and a reason ("Two misconceptions scored almost the same"). One click assigns.

**F5. TA sees why misconception beats question number.** `/ta/compare` shows both groupings side by side
and the "reports supporting your first explanation" number for each.

**F6. Anyone checks the AI.** `/ta/eval` runs the engine on the held-out set and shows measured metrics,
a confusion table and every miss. Same numbers via `npm run eval`.

**F7. Optional live model.** `/ta/settings` → choose Live engine → base URL, model, key (localStorage) →
"Test connection" → on `/ta`, "Re-run with live model" re-classifies all non-corrected reports. Any failure
→ that report abstains with a reason; a banner explains, and Sample results remain available via
"Re-run with Sample engine".

**F8. Reset.** "Reset demo data" (in TA header menu) reseeds the 60 seed reports and clears corrections.

## 3. Screens

All TA screens share a header: product name, unit name ("Unit 3: Heuristic search"), engine badge
("Sample engine · offline" or "Live engine · {model}"), review queue chip with count, nav
(Dashboard · Review · Compare · Eval · Settings), and a persistent small "Synthetic demo data" tag.

| Route | Screen | Must show |
|---|---|---|
| `/` | Landing | One-line pitch, two doors: "I'm a student" → `/submit`, "I'm a TA" → `/ta`. Short "How it works" in 3 steps. Engine badge. |
| `/submit` | Student submit | Question select, textarea with live char count, "Don't include your name" hint, privacy line, Submit (disabled until valid), success state with "Submit another". Mobile-first. |
| `/ta` | Dashboard | Left (primary): **Teach-first list**, rank number, misconception name, count, reason line ("14 reports across Q2, Q4, Q5"), confirmed count. Right: **Heatmap**. Below: recent corrections (last 8). Toolbar: Refresh, Re-run with live model (only when Live configured). Empty state when 0 reports. |
| `/ta/m/[id]` | Cluster detail | Inline-editable name (rename), definition, "What to say" one-line teaching hint (static, from taxonomy), counts by question, list of reports: full sentence with `<mark>` on evidence excerpt, question tag, confidence bar + number, source badge (AI · TA confirmed · TA moved), actions Confirm / Move to… (menu) / Not this. |
| `/ta/review` | Review queue | Each item: sentence, question tag, reason, top-2 guesses with scores as one-click "Assign to X" buttons, plus "Move to…" for any other. Empty state: "Nothing waiting. Every report has a misconception." |
| `/ta/compare` | Compare view | Two columns. Left "Grouped by question number": questions ranked by count; for the top question, its mix of misconceptions as a stacked bar. Right "Grouped by misconception": teach-first list. Headline numbers: "First explanation reaches N reports" for each. One sentence of conclusion generated from the data (template, not AI). |
| `/ta/eval` | Evaluation | Engine used, run timestamp, held-out size, metric cards (section 7), naive baseline, confusion table (gold rows × predicted cols incl. abstain), list of misses with sentence and both labels, thresholds used, "Synthetic held-out set, 20 items: small, indicative only". Button "Run again". If Live configured, a second button "Evaluate live engine" (runs on held-out, shows its own numbers). |
| `/ta/settings` | Settings | Sample / Live selector, approved HTTPS base URL (default `https://api.openai.com/v1`), model, key field with show toggle, "Test connection", "Forget key", and disclosure of browser key storage and live provider requests. |

## 4. Architecture

```
Browser (React client components)                 Next.js server (same process)
  /submit, /ta/*  -- useTRPC() + TanStack Query -->  /api/trpc/[trpc]  (fetchRequestHandler)
  Settings: liveConfig in localStorage                  appRouter
                                                         ├─ report.*      ─┐
                                                         ├─ dashboard.*    │  store (globalThis singleton,
                                                         ├─ cluster.*      ├─ seeded from src/data/seed.ts)
                                                         ├─ review.*       │
                                                         ├─ correction.*  ─┘
                                                         ├─ engine.rerun ──> live adapter ──> {baseUrl}/chat/completions
                                                         └─ eval.run     ──> sample/live engine on src/data/heldout.ts
```

### 4.1 Directory layout

```
src/
  app/
    layout.tsx, page.tsx, globals.css
    submit/page.tsx
    ta/layout.tsx, ta/page.tsx, ta/m/[id]/page.tsx, ta/review/page.tsx,
    ta/compare/page.tsx, ta/eval/page.tsx, ta/settings/page.tsx
    api/trpc/[trpc]/route.ts
  components/            Heatmap, TeachFirstList, ReportCard, EvidenceText, ConfidenceBar,
                         MoveMenu, EngineBadge, TaHeader, EmptyState, MetricCard
  trpc/                  init.ts, query-client.ts, client.tsx, server.tsx, routers/_app.ts,
                         routers/{report,dashboard,cluster,review,correction,engine,eval}.ts
  domain/                types.ts, taxonomy.ts, questions.ts, redact.ts, ranking.ts, heatmap.ts, compare.ts
  engine/                contract.ts (zod + validateResult), sample/{normalize,cues,tfidf,clauses,classify}.ts,
                         live/openaiCompatible.ts, index.ts (classify(report, engineConfig))
  store/                 memory.ts (state, seed, corrections, exemplars)
  data/                  seed.ts (60), heldout.ts (20)
  eval/                  metrics.ts, runEval.ts
  lib/                   liveConfig.ts (localStorage hook)
scripts/eval.ts          prints metrics table for the Sample engine
tests/                   *.test.ts (vitest)
```

### 4.2 Domain types (TypeScript sketch, not final code)

```ts
type QuestionId = "Q1" | "Q2" | "Q3" | "Q4" | "Q5" | "NS";
type MisconceptionId = "admissible-means-consistent" | "any-heuristic-optimal" | "g-h-swapped"
  | "closed-never-reopened" | "bigger-h-always-better" | "goal-test-on-generation";
type Label = MisconceptionId | "abstain";

interface StuckReport { id: string; questionId: QuestionId; text: string; createdAt: string;
  assignment: Assignment; }
interface Assignment { label: Label; evidenceExcerpt: string; confidence: number;
  candidates: { id: MisconceptionId; score: number }[]; engine: "sample" | "live";
  source: "ai" | "ta-confirmed" | "ta-moved" | "ta-rejected"; reason?: string; }
interface Misconception { id: MisconceptionId; name: string; defaultName: string; definition: string;
  teachingHint: string; }
interface Correction { id: string; at: string; kind: "confirm" | "move" | "reject" | "rename";
  reportId?: string; from?: Label; to?: Label; misconceptionId?: MisconceptionId; oldName?: string; newName?: string; }
```

`ta-rejected` reports have label `abstain` and appear in the review queue.

### 4.3 tRPC procedures

| Procedure | Kind | Input | Output |
|---|---|---|---|
| `report.submit` | mutation | `{ questionId, text }` (zod: 10..280 chars after trim) | `{ ok: true }` only (no label to the student) |
| `dashboard.summary` | query | none | `{ totals, teachFirst[], heatmap, recentCorrections[], engine }` |
| `cluster.byId` | query | `{ id }` | `{ misconception, reports[], countsByQuestion }` |
| `review.list` | query | none | `{ reports[] }` (label abstain) |
| `correction.confirm` | mutation | `{ reportId }` | updated report |
| `correction.move` | mutation | `{ reportId, to: MisconceptionId }` | updated report |
| `correction.reject` | mutation | `{ reportId }` | updated report |
| `correction.rename` | mutation | `{ misconceptionId, name }` (1..60 chars) | misconception |
| `compare.get` | query | none | `{ byQuestion[], byMisconception[], topQuestionMix[], reach: { byQuestion, byMisconception }, sentence }` |
| `engine.rerun` | mutation | `{ engine: "sample" } \| { engine: "live", baseUrl, model, apiKey }` | `{ processed, abstained, failed }` |
| `engine.test` | mutation | live config | `{ ok, message }` |
| `eval.run` | query | none | Sample `EvalReport` (section 7) |
| `eval.runLive` | mutation | live config | Live `EvalReport` (section 7) |
| `admin.reset` | mutation | none | `{ ok: true }` |

Rules: the server never logs inputs of `engine.*` / `eval.runLive` (they can carry a key). Error messages returned
to the client must not echo the key. All mutations invalidate `dashboard`, `cluster`, `review`, `compare`.

## 5. Taxonomy and synthetic data

### 5.1 Homework questions (synthetic, written for this project)

| Id | Prompt (shown in UI) |
|---|---|
| Q1 | A robot moves on a 4-connected grid with step cost 1. Is straight-line distance admissible here? Is Manhattan distance? Is either consistent? |
| Q2 | Trace A* tree search on Graph G from S to the goal. List the expansion order with g, h and f values. |
| Q3 | For Graph H and the given h table, show whether h is consistent. |
| Q4 | Run A* graph search with a closed set on Graph K, where h is admissible but not consistent. Does it return the optimal path? |
| Q5 | Weighted A* uses f = g + 2·h. Is the returned path guaranteed to be optimal? Explain. |
| NS | Not sure which question |

### 5.2 Misconceptions (the taxonomy)

| Id | Default name | Definition (student believes…) | Teaching hint |
|---|---|---|---|
| `goal-test-on-generation` | A* stops when the goal is generated | the search can return as soon as the goal is added to the open list | Optimality needs the goal test when the goal is *popped* (expanded), because a cheaper path may still be on the frontier. |
| `admissible-means-consistent` | Admissible and consistent are the same | every admissible heuristic is consistent (or the two words are interchangeable) | Consistency is a per-edge triangle inequality; it implies admissibility but not the reverse. Show a counterexample. |
| `any-heuristic-optimal` | A* is optimal with any heuristic | A* returns an optimal path regardless of the heuristic | Optimality needs admissibility (tree search) or consistency (graph search without reopening). |
| `g-h-swapped` | Mixing up g(n) and h(n) | g is the estimate and h is the cost so far, or f is computed with the wrong parts | g is known cost from the start; h is the estimate to the goal; f = g + h ranks the frontier. |
| `closed-never-reopened` | Closed nodes never need reopening | once a node is in the closed set its cost can never improve | With an inconsistent heuristic, a cheaper path to a closed node can appear; graph search must reopen it or lose optimality. |
| `bigger-h-always-better` | A bigger heuristic is always better | a larger h is always preferable, even if it overestimates | Larger is better only while staying admissible (dominance); overestimating trades optimality for speed. |

### 5.3 Seed set: 60 reports (`src/data/seed.ts`)

Each item: `{ id, questionId, text, gold: Label }`. The gold label is used by tests and the compare test,
never shown in the UI. Designed distribution (gold labels):

| Misconception \ Question | Q1 | Q2 | Q3 | Q4 | Q5 | NS | Total |
|---|---|---|---|---|---|---|---|
| goal-test-on-generation | 0 | 5 | 0 | 4 | 5 | 0 | **14** |
| admissible-means-consistent | 4 | 0 | 5 | 2 | 0 | 0 | 11 |
| any-heuristic-optimal | 1 | 1 | 0 | 0 | 6 | 0 | 8 |
| g-h-swapped | 0 | 4 | 2 | 2 | 0 | 0 | 8 |
| closed-never-reopened | 0 | 1 | 0 | 6 | 0 | 0 | 7 |
| bigger-h-always-better | 2 | 0 | 0 | 0 | 3 | 0 | 5 |
| abstain (ambiguous) | 1 | 0 | 1 | 3 | 0 | 2 | 7 |
| **Total** | 8 | 11 | 8 | **17** | 14 | 2 | 60 |

Designed story (on gold labels; the dashboard shows engine labels, which may differ, and that is fine):
by question number Q4 is top (17), but the most common idea inside Q4 (`closed-never-reopened`) reaches only
7 reports across the full cohort (6 inside Q4); by misconception, `goal-test-on-generation` has 14 supporting reports across Q2, Q4 and Q5.

Writing rules for the data author:
- First person, informal, one sentence, 40 to 220 chars, varied vocabulary and typos in about 10%.
- No real names, courses, universities, textbook quotes, or copied exam questions.
- Ambiguous items are genuinely ambiguous: vague ("honestly Q4 just lost me"), or mixing two misconceptions
  ("I thought consistent and admissible were the same so I didn't reopen the closed node").
- Seed examples (style guide, not to be copied into held-out):
  - goal: "I returned the path as soon as the goal showed up in the frontier, why is that wrong"
  - goal: "my trace stops when G gets pushed with f=9 but the answer key keeps going"
  - consistent: "I said Manhattan is consistent because it's admissible, isn't that the same thing"
  - any-optimal: "for Q5 I assumed weighted A* still gives the shortest path since it's still A*"
  - g-h: "I added the heuristic of the parent instead of the path cost so my f values are all off"
  - closed: "once B is in the closed set I skipped it, I didn't know you'd ever look at it again"
  - bigger-h: "I picked the heuristic with the bigger numbers because bigger means more informed right"

### 5.4 Held-out set: 20 reports (`src/data/heldout.ts`)

Gold: goal 3, consistent 3, any-optimal 3, g-h 3, closed 2, bigger-h 2, abstain 4. Spread across Q1 to Q5 and
NS. Written in **one commit before any classifier tuning**, using different wording from the seed set
(e.g. "fringe", "explored set", "cost-so-far", "estimate", "pop vs push", "overshoots"). Used by eval only.
Threshold tuning ran on the seed set. The same author wrote the sets and classifier, and the synonym list
was chosen to cover held-out vocabulary. See [the evaluation log](EVAL.md).

## 6. Engine contract and engines

### 6.1 Contract (`src/engine/contract.ts`)

```ts
const EngineResult = z.object({
  misconceptionId: z.union([MisconceptionIdEnum, z.literal("abstain")]),
  evidenceExcerpt: z.string(),          // "" allowed only when abstain
  confidence: z.number().min(0).max(1),
  candidates: z.array(z.object({ id: MisconceptionIdEnum, score: z.number() })).max(2),
  engine: z.enum(["sample", "live"]),
  reason: z.string().optional(),
});
function validateResult(text: string, raw: unknown, engine): EngineResult
```

`validateResult` converts to abstain (keeping candidates, setting `reason`) when: zod parse fails, id not in
taxonomy, non-abstain with excerpt that is not a verbatim substring of `text` (case-sensitive after trimming
whitespace at both ends), or confidence below the engine's threshold.

### 6.2 Sample engine (deterministic)

1. **Normalise**: lowercase; map synonyms to tokens: `g(n)|g of n|path cost|cost so far|cost-so-far` → `gcost`;
   `h(n)|h of n|heuristic value|estimate` → `hcost`; `f(n)|f value` → `fcost`;
   `closed (set|list)|explored set|visited set` → `closedset`; `open (list|set)|frontier|fringe|priority queue|pq` → `openlist`.
   Keep an offset map so excerpts come from the original text.
2. **Cue score** per misconception: list of `{ pattern: RegExp, weight }` over normalised text, with a
   contrast guard (cue preceded by "not", "isn't", "why is", is still a cue: students describe their belief).
   Sum, then squash to 0..1 (`1 - exp(-sum)`).
3. **Similarity** per misconception: TF-IDF (unigrams + bigrams, normalised tokens, stopwords removed) cosine
   between the report and the misconception profile document (name + definition + cue phrases +
   exemplars from TA corrections).
4. **Combine**: `score = 0.65 * cue + 0.35 * sim`. Top-2 → candidates.
5. **Abstain** if fewer than 5 words, or `top < TAU` (start 0.30), or `top - second < DELTA` (start 0.08).
   Thresholds tuned on the seed set only and exported as constants shown on `/ta/eval`.
6. **Confidence** = `min(1, top) * min(1, (top - second) / 0.3)` rounded to 2 dp (monotone in both).
7. **Evidence**: split the original sentence into clauses at `. ; , ! ?` and the words
   `but|because|so|and then|since`; pick the clause with the highest cue+sim score for the chosen id; trim.

### 6.3 Live engine (`src/engine/live/openaiCompatible.ts`)

`POST {baseUrl}/chat/completions`, `temperature: 0`, system prompt = role + taxonomy table (ids, names,
definitions) + rules ("quote evidence verbatim; if unsure or two fit, return abstain"), user = the sentence and
question tag. `response_format` = json_schema of the contract (strict); on HTTP 400 retry once with
`{type:"json_object"}`. 20 s timeout, max 6 concurrent. Output → `validateResult`. HTTP/network/parse error
→ abstain with reason "Live engine error: {status}" (never the key).

### 6.4 Exemplars (cuttable)

Confirm and move corrections add the report text to that misconception's exemplar list (max 20, FIFO);
reject removes it. The Sample engine profile document includes exemplars, so a similar new submission can
land correctly after a TA correction. Demo: move one abstained report, then submit a near-paraphrase and show
it is assigned.

## 7. Evaluation

`runEval(engine, items)` returns:

| Metric | Definition |
|---|---|
| Overall agreement | items where predicted label == gold label (abstain counts as a label) / 20 |
| Accuracy when answered | correct / items where engine did not abstain and gold ≠ abstain |
| Coverage | items not abstained / items whose gold ≠ abstain |
| Abstain rate | items abstained / 20 |
| Ambiguous caught | abstained / items with gold = abstain |
| Naive by-question baseline | for each held-out item, predict the seed set's most common gold misconception for that question; overall agreement of that baseline |

Also: confusion table, list of misses, thresholds, engine, timestamp. `npm run eval` prints the same as a
table. README quotes the first frozen run verbatim with date and commit hash. No metric is ever typed by
hand into the UI or docs.

## 8. Ranking, heatmap and compare (pure functions in `src/domain/`)

- `teachFirst(reports)`: group by label (excluding abstain) → sort by count desc, then distinct questions
  desc, then TA-confirmed/moved count desc, then id asc. Reason string: "{n} reports across Q2, Q4, Q5".
- `heatmap(reports, order)`: rows = teach-first order (all six, zero rows shown faded), cols = Q1..Q5, NS.
  Cell fill = 5-step scale by count / max count.
- `compare(reports)`: byQuestion ranking; topQuestionMix; reach.byQuestion = count of the most common label
  inside the top question; reach.byMisconception = count of the top teach-first item; sentence template:
  "Grouping by question says start with {Q}. But one explanation of '{name}' has {n} supporting reports across
  {questions}, versus {m} for the most common idea inside {Q}." If both agree: "Both views agree: start with…".

## 9. Visual direction ("marked-up answer sheet")

Operate mode: precision and restraint. Read `REFS` design skills (impeccable craft floor, Emil Kowalski motion,
Jakub Krehel better-ui) before UI work.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FAF7F0` | page background |
| `--paper-2` | `#F1ECE1` | panels, table stripes |
| `--rule` | `#DCD3C3` | 1px borders, grid lines |
| `--ink` | `#1C1B18` | body text (contrast > 15:1 on paper) |
| `--ink-2` | `#5A554C` | secondary text (> 7:1) |
| `--pencil` | `#B8361E` | the single accent: heat, evidence underline, focus ring |
| `--ok` | `#2E6A4D` | TA-confirmed badge |
| heat 1..5 | `#F6E8E0 #EDC6B6 #E19C86 #CF6B52 #B8361E` | heatmap cells; ink text on 1..3, paper text on 4..5 |

Type: Geist Sans (UI, 15px base, 1.5 line-height), Geist Mono with `tabular-nums` for every count and score.
Sizes 13/15/18/24/32. Left-aligned layouts, 8px spacing grid, 6px radius, no shadows except menus.
Evidence: `<mark>` with transparent background, 2px `--pencil` underline and slight tint (`--heat-1`).
Motion: counts and row reorders animate 180ms `cubic-bezier(0.2, 0, 0, 1)`; nothing else moves;
`prefers-reduced-motion` disables it. Focus: 2px `--pencil` outline, 2px offset, on every interactive element.
Heatmap cells are buttons with `aria-label="{misconception}, {question}: {n} reports"`. Every count is also
text (no colour-only meaning). Mobile: `/submit` is single-column at 375px; TA pages stack below 900px.

## 10. Judge scorecard (highest weight first)

| Criterion (rules weight) | What the judge must see | Where |
|---|---|---|
| Innovation & originality (25) | Grouping by misconception across questions; compare view proves a different first explanation; abstain by default | `/ta/compare`, video 0:40 |
| Technical implementation (25) | End-to-end typed tRPC v11 contract, deterministic engine with zod-validated output, unit tests, `npm run eval` | repo, `/ta/eval`, README "How it works" |
| Real-world impact (20) | The TA's 10 minutes; one explanation reaching N reports; works offline with zero setup | landing, `/ta`, video 0:00 |
| AI integration & responsible use (15) | Verbatim evidence, abstention, TA corrections, no label returned by the form, basic redaction, measured results with misses, and live data disclosure | `/ta/m/[id]`, `/ta/review`, `/ta/eval`, Settings note |
| UX & presentation (15) | Calm "answer sheet" look, readable heatmap, 30-second student flow on mobile, clear video | all screens, screenshots |

## 11. Video script (about 3:00)

| Time | Screen | Voice-over (approx.) |
|---|---|---|
| 0:00 | Landing | "Ten minutes before office hours, a TA has one question: what should I explain first? Today they sort complaints by homework question. That's the wrong axis." |
| 0:15 | `/submit` on phone width | "Students tell us where they got stuck in one sentence. No name, no account. They don't get a label back." Submit one. |
| 0:35 | `/ta` | "The TA sees misconceptions, not question numbers. Ranked, with the reason: fourteen reports across three questions." Hover heatmap. |
| 0:55 | `/ta/compare` | "Grouping by question says start with Q4. But the biggest idea inside Q4 has seven supporting reports across all questions. Explaining goal-test timing has fourteen supporting reports, across Q2, Q4 and Q5." |
| 1:25 | `/ta/m/goal-test-on-generation` | "Accepted engine assignments retain verbatim excerpts and heuristic match support. Human moves can have no retained excerpt; read the full report and its human status." Rename the misconception; confirm one report. |
| 1:50 | `/ta/review` | "When it isn't sure, it abstains. This one mixes two ideas, so a human decides." Assign with one click; count updates. (If exemplars shipped: submit a paraphrase, it lands correctly.) |
| 2:15 | `/ta/eval` | "We measured it on 20 synthetic examples. See every miss. The synonym list reflects vocabulary in the test set." Read the numbers on screen. |
| 2:40 | `/ta/settings` | "Sample mode runs offline. If you opt into live mode, the demo server sends your key and redacted reports to the provider on a rerun." |
| 2:50 | `/ta` | "Office Hours Heatmap: explain the right thing first." |

## 12. Devpost copy

- **Title:** Office Hours Heatmap
- **Tagline:** Students say where they got stuck in one sentence. TAs see which misconception to explain first.
- **Description (draft):**
  - *Problem:* Before office hours a TA has minutes to decide what to explain. Student notes get sorted by
    homework question, but one misconception spreads across questions and one question hides several.
  - *Solution:* Anonymous one-sentence stuck reports, grouped by the underlying misconception with the
    student's own words as evidence, ranked into a teach-first list and a misconception × question heatmap.
    Ambiguous reports are not guessed: they go to a review queue. TAs can confirm, move, reject or rename,
    and every correction is logged.
  - *AI implementation:* A deterministic, offline Sample engine (synonym normalisation, weighted cue patterns,
    TF-IDF similarity to misconception definitions and TA-confirmed exemplars, abstain rule) is the default.
    An optional Live engine calls an approved OpenAI-compatible provider with a JSON-schema contract. Both outputs pass
    the same validator: the evidence must be a verbatim quote or the result becomes an abstain.
  - *Responsible use:* public demo for synthetic reports, basic redaction, no label returned by the student form,
    human corrections, measured evaluation including misses, and disclosure of live provider requests.
  - *Built with:* Next.js, React, tRPC, TanStack Query, zod, TypeScript, Vitest.
  - *Measured results:* paste from `npm run eval` output only.

## 13. Submission checklist

- [ ] Public repo with MIT LICENSE, README (all sections from the common brief), setup in 2 commands
- [ ] README "How this was built" discloses AI-assisted development
- [ ] At least 3 screenshots in `docs/images/` (dashboard hero, compare, cluster detail, review, eval)
- [ ] `npm run build` and `npm test` pass on a clean clone; `npm run eval` output pasted into README with date + commit
- [ ] Accessible demo or video link and repository link, checked while signed out
- [ ] About 2 to 4 minutes for the video. Use fictional reports and keep credentials off screen.
- [ ] Devpost fields: name, tagline, problem/solution, AI implementation, built with, screenshots, repo, video
- [ ] Every data screen labelled "Synthetic demo data"; no real student data or course materials anywhere
- [ ] No secrets, no `.env`, no AI co-author trailers in git history

## Revision: fair cohorts and teaching briefs (2026-11-21)

Select the by-question baseline concept using the busiest question and its most common non-abstain label.
Measure that selected concept across the full current report cohort, matching the misconception view's
measurement scope. The seed example is 7 versus 14 reports; counts do not identify unique students.

The dashboard provides a selection of one or two existing concepts and exports Markdown and JSON with their static teaching hints,
current report evidence, provisional/TA-checked counts and remaining review count. Recompute from current
assignments and display names after corrections, renames and reset. Do not generate teaching advice.

Keep `confidence` internally for compatibility, but label the visible signal “match support”; it is not a
calibrated probability. Evaluation adds issued-label precision over every non-abstain prediction, including
ambiguous false positives, separate from clear-gold conditional accuracy. Zero denominators return no
available precision. Authored challenge cases do not establish independent validation or classroom impact.

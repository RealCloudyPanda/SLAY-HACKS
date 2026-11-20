# Build plan: Office Hours Heatmap

24 commit-sized tasks, riskiest first. One task = one commit (conventional-commit message, no AI trailers,
straight to `main`, never push). Each task lists the files it touches and the check that must pass before
committing. Spec: [`SPEC.md`](SPEC.md). Language: [`GLOSSARY.md`](../GLOSSARY.md).

Ground rules for the implementer
- Before tRPC work, read the official skills without modifying repo config:
  `npx @tanstack/intent@latest load @trpc/next#nextjs-app-router` and
  `npx @tanstack/intent@latest load @trpc/tanstack-react-query#react-query-setup` (do not run `intent install`).
- Before UI work, read the design refs listed in the common brief (impeccable craft floor, Emil Kowalski,
  Jakub Krehel) and the tokens in SPEC section 9.
- No `.env`, no database, no network at runtime unless the TA configured the Live engine.
- `src/data/heldout.ts` is never read while tuning. If you change cues after seeing held-out misses, log it
  (task 9) and report both numbers.
- If a task marked **cuttable** runs long, skip it and note it in README "Known limitations".

---

## Phase A: foundations and the risky core

**1. `chore: scaffold Next.js app with TypeScript and Vitest`**
Files: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/{layout,page}.tsx`, `src/app/globals.css`,
`vitest.config.ts`, `tests/smoke.test.ts`, `.nvmrc` (22).
Deps: `next@^16.4`, `react@^19.3`, `react-dom@^19.3`, `zod@^4.6`, `geist@^1.9`; dev: `typescript@^6.0.3`,
`@types/react`, `@types/react-dom`, `@types/node`, `vitest@^5.1`, `tsx@^4.23`, `eslint` + `eslint-config-next` if
create-next-app adds them. Scripts: `dev`, `build`, `start`, `test` (`vitest run`), `eval` (`tsx scripts/eval.ts`).
Check: `npm run build` and `npm test` pass; TS is 6.x (`npx tsc -v`).

**2. `feat: wire tRPC v11 with TanStack React Query`**
Files: `src/trpc/{init.ts,query-client.ts,client.tsx,server.tsx}`, `src/trpc/routers/_app.ts` (a `health` query),
`src/app/api/trpc/[trpc]/route.ts`, `src/app/layout.tsx` (TRPCReactProvider), `src/app/page.tsx` (renders health
via `useTRPC` + `useQuery`).
Deps: `@trpc/server@^11.29`, `@trpc/client@^11.29`, `@trpc/tanstack-react-query@^11.29`,
`@tanstack/react-query@^5.108`, `server-only`.
Check: `npm run dev`, `curl -s localhost:3000/api/trpc/health` returns JSON; page shows the value; build passes.

**3. `feat: add domain types, taxonomy and homework questions`**
Files: `src/domain/{types.ts,taxonomy.ts,questions.ts}`, `tests/taxonomy.test.ts`.
Check: tests assert six unique ids matching SPEC 5.2, every misconception has name/definition/teachingHint,
questions Q1..Q5 + NS.

**4. `feat: add 60-report synthetic seed set with gold labels`**
Files: `src/data/seed.ts`, `tests/seed.test.ts`.
Check: test rebuilds the SPEC 5.3 table from gold labels and asserts every cell exactly; all texts 10..280
chars; ids unique; no duplicate texts.

**5. `feat: add 20-report held-out set (frozen before engine tuning)`**
Files: `src/data/heldout.ts`, `tests/heldout.test.ts`.
Check: gold counts match SPEC 5.4; no text shares a 6-word run with any seed text (test it).

**6. `feat: define engine contract and shared result validator`**
Files: `src/engine/contract.ts`, `tests/contract.test.ts`.
Check: tests cover: valid result passes; unknown id → abstain; non-verbatim excerpt → abstain with reason;
confidence below threshold → abstain; garbage input → abstain.

**7. `feat: add normaliser and clause splitter with offset mapping`**
Files: `src/engine/sample/{normalize.ts,clauses.ts}`, `tests/normalize.test.ts`.
Check: synonyms map to tokens per SPEC 6.2; every clause maps back to an exact substring of the original.

**8. `feat: implement deterministic Sample engine with abstain rule`**
Files: `src/engine/sample/{cues.ts,tfidf.ts,classify.ts}`, `src/engine/index.ts`, `tests/sampleEngine.test.ts`.
Tune `TAU`, `DELTA`, weights on the seed set only.
Check: 12 hand-written sentences (2 per misconception, not from either dataset) classify correctly; 3 vague
or mixed sentences abstain; same input twice gives identical output; every non-abstain excerpt is a verbatim
substring. Print seed-set agreement in the test output (informational, not asserted).

**9. `feat: add evaluation metrics and npm run eval`**
Files: `src/eval/{metrics.ts,runEval.ts}`, `scripts/eval.ts`, `tests/metrics.test.ts`, `docs/EVAL.md`.
Check: metrics maths unit-tested on a tiny hand-made confusion; `npm run eval` prints all SPEC 7 metrics +
baseline + misses. Paste the first (frozen) held-out output into `docs/EVAL.md` with date and commit hash.
Do not edit those numbers later; append new runs below.

**10. `feat: add in-memory store with redaction and corrections`**
Files: `src/domain/redact.ts`, `src/store/memory.ts`, `tests/{redact,store}.test.ts`.
Store on `globalThis.__ohh`; lazy seed (classify all 60 with Sample engine); `submit`, `confirm`, `move`,
`reject`, `rename`, `reset`, `rerun(engineFn)` that skips TA-corrected reports; correction log.
Check: tests for each correction kind, log entries, rerun skips corrected reports, redaction cases
(email, 9-digit number, "my name is Sam").

**11. `feat: add teach-first ranking, heatmap and compare functions`**
Files: `src/domain/{ranking.ts,heatmap.ts,compare.ts}`, `tests/{ranking,compare}.test.ts`.
Check: ordering and tie-breaks per SPEC 8; on **gold** seed labels, compare returns top question Q4,
reach.byQuestion = 6, top misconception `goal-test-on-generation`, reach.byMisconception = 14.

**12. `feat: expose app routers over tRPC`**
Files: `src/trpc/routers/{report,dashboard,cluster,review,correction,compare,admin}.ts`, `_app.ts`,
`tests/routers.test.ts` (via `createCallerFactory`).
Check: caller tests: submit → appears in dashboard totals; move updates counts and log; invalid input rejected
by zod; `report.submit` returns no label.

## Phase B: screens

**13. `style: add design tokens, fonts and TA shell`**
Files: `src/app/globals.css`, `src/app/layout.tsx` (Geist), `src/components/{TaHeader,EngineBadge}.tsx`,
`src/app/ta/layout.tsx`, `src/app/page.tsx` (landing with two doors).
Check: landing + empty `/ta` render; tab focus visible everywhere; contrast tokens per SPEC 9.

**14. `feat: build student submit page`**
Files: `src/app/submit/page.tsx`, `src/components/SubmitForm.tsx`.
Check: at 375px width the form is usable; char counter; disabled until valid; success state; submitted report
shows up on `/ta` after refresh; no label shown to the student.

**15. `feat: build TA dashboard with teach-first list and heatmap`**
Files: `src/app/ta/page.tsx`, `src/components/{TeachFirstList,Heatmap,RecentCorrections,EmptyState}.tsx`.
Check: seeded data renders ranked list with reason lines and a 6×6 heatmap; cells have aria-labels; Refresh
works; empty state after clearing (temporarily) works.

**16. `feat: build cluster detail with evidence and corrections`**
Files: `src/app/ta/m/[id]/page.tsx`, `src/components/{ReportCard,EvidenceText,ConfidenceBar,MoveMenu,RenameField}.tsx`.
Check: evidence highlighted inside full sentence; confirm/move/reject/rename update the page and dashboard
without reload; rename persists across navigation; invalid id → not-found page.

**17. `feat: build review queue`**
Files: `src/app/ta/review/page.tsx`.
Check: abstained + rejected reports listed with reason and top-2 "Assign to" buttons; assigning removes the
item and bumps the header chip count down; empty state text per SPEC 3.

**18. `feat: build compare view`**
Files: `src/app/ta/compare/page.tsx`, `src/components/{QuestionMixBar,ReachStat}.tsx`.
Check: both columns, reach numbers and the template sentence render from live store data; after moving reports
the numbers change accordingly.

**19. `feat: build evaluation page`**
Files: `src/app/ta/eval/page.tsx`, `src/components/{MetricCard,ConfusionTable}.tsx`, `src/trpc/routers/eval.ts`.
Check: numbers on the page equal `npm run eval` output for the same commit; misses listed; "Synthetic, 20
items, indicative only" note visible.

## Phase C: optional AI, learning loop, polish, docs

**20. `feat: add optional live engine and settings`**
Files: `src/engine/live/openaiCompatible.ts`, `src/trpc/routers/engine.ts`, `src/lib/liveConfig.ts`,
`src/app/ta/settings/page.tsx`, `tests/liveEngine.test.ts` (mocked `fetch`).
Check: mocked happy path validates; 400 on json_schema retries with json_object; timeout/HTTP error → abstain
with reason that never contains the key; settings save/forget in localStorage; "Re-run with live model" button
appears only when configured. Live eval button on `/ta/eval` uses `eval.run` mutation.

**21. `feat: let TA corrections become exemplars for the Sample engine`** (**cuttable**)
Files: `src/store/memory.ts`, `src/engine/sample/classify.ts`, `tests/exemplars.test.ts`.
Check: a test sentence that abstains before a related move is assigned to the moved-to misconception after it;
held-out eval is unaffected (exemplars are store-only, eval uses a clean engine instance).

**22. `style: polish motion, empty states, responsive and a11y`**
Files: components touched as needed, `globals.css`.
Check: impeccable audit pass (keyboard-only walkthrough of all flows, 375px and 1440px screenshots,
`prefers-reduced-motion` honoured, no colour-only meaning); `npm run build` has no warnings from our code.

**23. `docs: write README with screenshots`**
Files: `README.md`, `docs/images/{hero,compare,cluster,review,eval,submit}.png`.
Capture with headless Chrome (command in the common brief) against `npm run start` after `npm run build`.
Check: all README sections from the common brief present; at least 3 images render on GitHub; measured numbers
copied from `docs/EVAL.md` with date + commit; "How this was built" discloses AI-assisted development;
"Known limitations" lists in-memory per-instance state, no auth, synthetic data, small eval set.

**24. `chore: verify clean install, build, tests and eval`**
Files: README tweaks only if something changed.
Check: `rm -rf node_modules .next && npm install && npm run build && npm test && npm run eval` all succeed;
`git log` shows no AI trailers; `git status` clean.

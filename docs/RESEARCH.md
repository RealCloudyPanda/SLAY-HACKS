# Research notes

Collected 2026-11-20 by the planner. "Verified" means checked this session (npm registry, GitHub search,
official docs). "Background" means known prior work cited from memory; treat titles as pointers, not quotes.

## 1. Prior art: grouping student answers and misconceptions

| Thing | What it does | Gap we fill | Source |
|---|---|---|---|
| Gradescope Answer Groups (AI-assisted) | Suggests groups of similar answers to one question so a grader grades the group once; instructor confirms groups. | Groups **within one question** for **grading**. We group **across questions** by **underlying misconception** for **teaching**, and abstain. | Verified: Gradescope help center, "AI-assisted grading and answer groups" (help.gradescope.com) |
| Office-hours queues (CMU 15-122 `q`, Berkeley CS61B SOHQ, Penn Labs OHQ, UMich ROHQ) | First-come queue of students waiting for a TA, often with a free-text "what do you need help with". | They order **people**; nobody aggregates the free text into "what to explain once to everyone". | Verified: GitHub `jburns20/q`, `Berkeley-CS61B/simple-office-hours-queue`, `pennlabs/office-hours-queue`, `tl-its-umich-edu/remote-office-hours-queue` |
| Eedi "Mining Misconceptions in Mathematics" (Kaggle) | Map a wrong multiple-choice answer to a misconception from a fixed library. | Confirms "assign to a fixed misconception taxonomy" is a recognised framing; ours is free-text, CS, with abstain + human correction. | Verified: several GitHub repos referencing the competition (e.g. `Princeu3/Misconception_Detection`) |
| Student-code misconception detectors (e.g. `KlTobias/MisconceptionDetection`) | LLM flags misconceptions in novice code. | Code-only, per student; no TA aggregate view. | Verified: GitHub search |
| Powergrading (Basu, Jacobs, Vanderwende, TACL 2013) | Clusters short answers so one grader action covers many. | Same "amplify human effort" idea, but for grading one question. | Background |
| OverCode (Glassman et al., 2015) | Clusters many code solutions so instructors see the variation. | Solutions, not confusions; no abstain. | Background |

Takeaway: the novel combination is **cross-question misconception grouping for teaching order**, with
**verbatim evidence**, **abstain** and **first-class TA corrections**, plus a visible comparison against the
by-question baseline that tools like answer groups implicitly use.

## 2. Stack versions (verified with `npm view`, 2026-11-20)

| Package | Latest | Notes |
|---|---|---|
| `next` | 16.4.6 | App Router. React peer `^19`. |
| `react` / `react-dom` | 19.3.1 | |
| `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query` | 11.29.5 | Use the new TanStack integration, not the classic `@trpc/react-query`. Peer: `@tanstack/react-query ^5.106.0`, `typescript >=5.7.2`. |
| `@tanstack/react-query` | 5.108.1 | |
| `zod` | 4.6.7 | |
| `superjson` | 2.2.6 | Not needed: all payloads are plain JSON (dates as ISO strings). Skip. |
| `typescript` | latest 7.0.2, 6.0.3 available | Pin `^6.0.3` (see GRILL Q25). |
| `vitest` | 5.1.1 | |
| `tsx` | 4.23.15 | For `npm run eval`. |
| `geist` | 1.9.2 | Local font files, no Google Fonts fetch. |
| `server-only` | 0.0.1 | Guard for `src/trpc/server.tsx`. |
| `@huggingface/transformers` | 4.3.2 | ~10 MB unpacked, deps `onnxruntime-node`, `onnxruntime-web`, `sharp`. Not used (ADR 0002). |

## 3. tRPC v11 + Next.js App Router setup (verified from trpc.io)

Official agent skills exist: `npx @tanstack/intent@latest install`, then
`npx @tanstack/intent@latest load @trpc/next#nextjs-app-router` and
`@trpc/tanstack-react-query#react-query-setup`. Implementers should load these before writing tRPC code
(they version with the installed packages).

Recommended layout from the TanStack React Query "server components" guide, adapted to `src/`:

```
src/trpc/init.ts            initTRPC.create(); export createTRPCContext (cache-wrapped),
                            createTRPCRouter, createCallerFactory, baseProcedure
src/trpc/routers/_app.ts    appRouter = createTRPCRouter({...}); export type AppRouter
src/trpc/query-client.ts    makeQueryClient(): staleTime > 0, dehydrate pending queries
src/trpc/client.tsx         'use client'; createTRPCContext<AppRouter>() -> TRPCProvider, useTRPC;
                            TRPCReactProvider (QueryClientProvider + TRPCProvider, httpBatchLink to /api/trpc)
src/trpc/server.tsx         import 'server-only'; getQueryClient = cache(makeQueryClient);
                            trpc = createTRPCOptionsProxy({ ctx, router, queryClient }); HydrateClient; prefetch
src/app/api/trpc/[trpc]/route.ts   fetchRequestHandler({ endpoint: '/api/trpc', req, router, createContext }); GET + POST
```

Usage: client components call `const trpc = useTRPC(); useQuery(trpc.dashboard.summary.queryOptions())`
and `useMutation(trpc.correction.move.mutationOptions({ onSuccess: invalidate }))`. Invalidation via
`queryClient.invalidateQueries({ queryKey: trpc.dashboard.pathKey() })`.

`getUrl()` in the guide reads `VERCEL_URL` on the server; that is a platform-provided variable, not one we
define. Simpler for us: server components use `prefetch` through `createTRPCOptionsProxy` with the in-process
router (no HTTP), so `getUrl()` only needs the relative `/api/trpc` in the browser.

## 4. transformers.js feasibility (decided against for v1)

- Works in browser and Node; sentence embeddings via `pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')`
  are the usual route (Background: ~20-25 MB quantized model download from the Hugging Face hub on first use).
- Breaks the "Sample mode works offline" rule unless model files are vendored into `public/` (large repo,
  slow clone) and adds native deps (`sharp`, `onnxruntime-node`) to a Next.js build.
- Our inputs are single sentences against six well-defined misconceptions; cue patterns + TF-IDF with an
  abstain rule are explainable, deterministic and fast. Revisit only if eval coverage is poor.

## 5. Chrome built-in AI (Prompt API)

- Structured output via `responseConstraint` (a JSON Schema) is documented on developer.chrome.com
  ("Structured output support for the Prompt API", Chrome 137+). Stable availability for regular web pages
  varies by Chrome version and device, and the Gemini Nano model needs a large one-time download.
- Decision: future work only (GRILL Q20). Judges on Safari/Firefox or older Chrome would see nothing.

## 6. Live engine: OpenAI-compatible Chat Completions

- One adapter covers many providers via `baseUrl` + `model` + key: `POST {baseUrl}/chat/completions` with
  `response_format: { type: "json_schema", json_schema: { name, strict: true, schema } }`.
- Not every compatible provider supports `json_schema`; the adapter must fall back to
  `response_format: { type: "json_object" }` on a 400 and rely on our zod validator either way.
- Temperature 0. One report per call, max 6 concurrent, 20 s timeout, failures become abstain with a reason.

## 7. Rubric and submission requirements

Rules page weights: Innovation 25, Technical 25, Real-world impact 20, AI integration and responsible use 15,
UX and presentation 15. Devpost widget: Innovation 30, Technical 30, Design/UX 20, Presentation/Impact 20.
The submission needs a project overview, problem and solution, an explanation of how AI is used, a working
demo or video, screenshots, an accessible source repository, and accurate team information. Devpost
recommends a video of about two to four minutes. The listing limits participation to eligible students.
[Official rules](https://slayy-hacks.devpost.com/rules) · [Event requirements](https://slayy-hacks.devpost.com/)

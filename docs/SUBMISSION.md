# Submission pack: SLAY HACKS 2026

Draft for the owner. Nothing here has been submitted. Rules and overview checked on slayy-hacks.devpost.com on 2026-11-21.

## Rules that matter (as read on 2026-11-21)

| Item | What the rules say | Status |
| --- | --- | --- |
| Deadline | **Mon Dec 7 2026, 5:00 PM ET.** | Aim to submit by **Sat Dec 5**. |
| Eligibility | "Subject to the requirements specified in the Eligibility section of the official hackathon page" (no age is stated in the rules text). | Owner to confirm on the page. |
| Theme | Must address the AI theme with a meaningful application of AI, an identifiable problem, a clear solution and a working prototype. | Deterministic Sample engine plus an optional live model; see the AI section below. |
| Required info | Title and description, the problem, details of the AI implementation, a working demo **or** video, screenshots, a source repo, accurate team info. | Drafted below. Six screenshots in `docs/images/`. |
| Video | Recommended, **about 2 to 4 minutes**. | Not recorded. Script below runs 3:00. |
| Judging | The overview page lists Innovation & Creativity 30, Technical Execution & Complexity 30, Design & UX 20, Presentation & Impact 20. The rules page lists a different split (Innovation 25, Technical 25, Real-World Impact 20, AI Integration & Responsible Use 15, UX & Presentation 15). | The pages disagree. Write for both: originality, solid tech, responsible AI, a clear video. |
| Best Beginner Hack ($500) | Only for projects built entirely by first-time hackathon participants. | Owner decides honestly whether this applies. |

## Video script (target 3:00)

1440×900; show `/submit` at phone width (390 px) in device mode. Use only the bundled synthetic reports and fictional text. Every number on screen comes from the app on the day you film.

| Time | Screen | Voice-over |
| --- | --- | --- |
| 0:00–0:20 | `/ta/compare`: by question, the first explanation reaches 6; by misconception, 14. | "Grouping office-hours questions by homework number says start with Q4. But the biggest idea in Q4 reaches six students. One explanation of 'A-star stops when the goal is generated' reaches fourteen, across three questions." |
| 0:20–0:35 | Landing page. | "Ten minutes before office hours, a TA has one question: what should I explain first? Office Hours Heatmap answers it." |
| 0:35–0:55 | `/submit` at phone width: pick a question, type one fictional sentence, submit. | "Students say where they got stuck in one sentence. No name, no account, and they don't get a label back." |
| 0:55–1:20 | `/ta`: teach-first list with reason lines; hover the heatmap. | "The TA sees misconceptions, not question numbers, ranked by how many students one explanation reaches, next to a misconception-by-question heatmap." |
| 1:20–1:45 | `/ta/m/goal-test-on-generation`: underlined verbatim evidence, confidence, "What to say". Rename the misconception; confirm one report. | "Every assignment shows its evidence, quoted word for word. If it isn't a real quote from the student, it can't reach the TA. Corrections are one click and logged." |
| 1:45–2:10 | `/ta/review`: an abstained report that mixes two ideas. Assign it; the count updates. | "When it isn't sure, it abstains. This one mixes two ideas, so a human decides." |
| 2:10–2:35 | `/ta/eval`: metrics table and the misses. | "We measured it on 20 held-out synthetic reports: 15 of 15 right when it answered, 4 abstentions, 2 misses, all shown here. A by-question baseline agrees 30% of the time." |
| 2:35–2:50 | `/ta/settings`. | "Sample mode runs offline with no setup. If you add your own model, reports are redacted before they're sent, and the same validator checks its answers." |
| 2:50–3:00 | `/ta`. Title card and repo URL. | "Office Hours Heatmap: explain the right thing first." |

## Devpost text

**Project name:** Office Hours Heatmap

**Elevator pitch** (≤200 chars):

> Students say where they got stuck in one sentence. TAs see which misconception to explain first, with the students' own words as evidence, and it abstains instead of guessing.

**About the project** (Devpost's markdown field):

```markdown
## The problem
Before office hours a TA has minutes to decide what to explain. Student notes get sorted by homework
question, but one misconception spreads across questions and one question hides several. In the demo data,
Q4 has the most complaints (17), yet its most common idea is shared by only 6 students, while explaining
"A* stops when the goal is generated" reaches 14 students across Q2, Q4 and Q5.

## What it does
- **Student form:** pick a question, write one sentence, submit. No account, no name, no label returned.
- **Teach-first list and heatmap:** misconceptions ranked by how many students one explanation reaches.
- **Cluster detail:** every report with the evidence quoted word for word, a confidence, and a teaching hint.
- **Review queue:** vague or mixed reports are not guessed; a TA assigns them with one click.
- **Compare view:** grouping by question vs by misconception, side by side.
- **Evaluation page:** measured results on a held-out set, with every miss.

## AI implementation
The default **Sample engine** is deterministic and offline: synonym normalisation, weighted cue patterns and
TF-IDF similarity to each misconception's definition and to TA-confirmed examples, with explicit abstain
rules for short, weak, close or mixed matches. An optional **Live engine** calls an OpenAI-compatible
endpoint with a strict JSON schema. Both pass the same zod validator: the label must come from the taxonomy
and the evidence must be an exact substring of the student's sentence, or the result becomes an abstention.

## Responsible use
Synthetic demo data only, basic redaction before storage, no label shown to students, human corrections
that are logged, abstention by default when unsure, and a measured evaluation that shows its misses. The live
engine has only been tested with a mocked provider.

## Measured results (`npm run eval`, 20 held-out synthetic reports, run 2026-11-21)
Overall agreement 90% (18/20) · accuracy when answered 100% (15/15) · abstain rate 20% (4/20) ·
ambiguous reports caught 75% (3/4) · naive by-question baseline 30%. A small set: one item is 5 points.

## How I built it
Next.js 16 (App Router) serving UI and API in one process, tRPC v11 with TanStack Query for one typed
contract, zod, TypeScript and Vitest. State lives in memory with no database, by design.

## Built with AI assistance
Planning, code and docs were drafted with AI coding assistants under my direction and checked by running the
tests and the eval. [[OWNER: name the assistants you used.]]
```

**Built with:** `next.js` · `react` · `trpc` · `tanstack-query` · `zod` · `typescript` · `vitest`

**Try it out:** [[hosted demo URL, if you deploy one]] · `https://github.com/RealCloudyPanda/SLAY-HACKS`

**Team:** [[OWNER: your name as entrant; solo]]

## Before you press submit
- [ ] Re-run `npm run eval` on the final commit and update the numbers if they changed.
- [ ] If you host it, remember anyone with the URL can change the demo data; keep it to synthetic reports.
- [ ] Video 2–4 minutes, public, no real student data on screen.
- [ ] Every `[[OWNER]]` line replaced or removed.
- [ ] Submit by Dec 5; the deadline is Dec 7, 5:00 PM ET.

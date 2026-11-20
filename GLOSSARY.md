# Glossary

The ubiquitous language of Office Hours Heatmap. Use these words in code, UI copy, docs and the video.

**Stuck report**
One anonymous sentence from a student describing where they got stuck, optionally tagged with a homework
question.
_Avoid_: response, submission, answer, ticket, feedback.

**Homework question**
A numbered question (Q1 to Q5) from the unit's synthetic problem set. A stuck report may be tagged with
one, or with "Not sure".
_Avoid_: problem, item, task.

**Misconception**
A specific, nameable wrong belief that explains why a student got stuck (for example "A* stops when the
goal is generated"). It is independent of any homework question.
_Avoid_: cluster, topic, category, bug, error type.

**Taxonomy**
The TA-owned list of misconceptions for one unit. The AI assigns stuck reports to it and never adds to it.
_Avoid_: label set, schema, ontology.

**Assignment**
The link between a stuck report and one misconception, with its source (AI or TA).
_Avoid_: classification result, prediction (in UI copy), tag.

**Abstain**
The outcome where the AI declines to assign a stuck report because the evidence is weak or split between
misconceptions.
_Avoid_: unknown, other, failure, null.

**Evidence excerpt**
The exact words from the stuck report that support an assignment, quoted verbatim.
_Avoid_: rationale, explanation, reason, summary.

**Confidence**
A number from 0 to 1 that says how strongly the engine preferred its chosen misconception over the rest.
_Avoid_: probability, accuracy, certainty.

**Review queue**
The TA's list of stuck reports that the AI abstained on or the TA rejected, waiting for a human decision.
_Avoid_: inbox, unassigned, triage, backlog.

**Correction**
A TA action that changes or confirms what the AI did: confirm, move, reject, or rename.
_Avoid_: override, edit, feedback, fix.

**Correction log**
The time-ordered record of every correction.
_Avoid_: audit trail, history, activity feed.

**Exemplar**
A stuck report whose assignment a TA confirmed or made, used as a reference example for its misconception.
_Avoid_: training data, sample, anchor.

**Teach-first list**
The misconceptions ranked by how many stuck reports they explain, with the reason shown for each rank.
_Avoid_: priority queue, leaderboard, top issues.

**Heatmap**
The grid of misconceptions by homework questions, where each cell counts stuck reports.
_Avoid_: matrix, chart, table (in UI copy).

**Compare view**
The side-by-side view of what the TA would teach first when grouping by homework question versus by
misconception.
_Avoid_: baseline view, A/B view.

**Engine**
The thing that turns a stuck report into an assignment or an abstain. There are two: the Sample engine
and the Live engine.
_Avoid_: model (for the Sample engine), AI, bot, classifier (in UI copy).

**Sample engine**
The default, offline, deterministic engine. Needs no key and gives the same output every run.
_Avoid_: demo mode, mock, fake AI, fallback.

**Live engine**
The optional engine that calls a language model the TA configured with their own key.
_Avoid_: real mode, online mode, GPT mode.

**Seed set**
The 60 synthetic stuck reports loaded into the demo and used for tuning.
_Avoid_: training set, sample data, fixtures (in UI copy).

**Held-out set**
The 20 synthetic stuck reports with gold labels used only for evaluation, never shown on the dashboard
and never used for tuning.
_Avoid_: test data, validation set.

**Gold label**
The intended misconception (or abstain) for a synthetic stuck report, written by the dataset author.
_Avoid_: ground truth, answer key, correct answer.

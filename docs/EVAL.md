# Evaluation log

Held-out set: `src/data/heldout.ts`, 20 synthetic reports, committed (7f44e69) before any engine code existed.
Engine thresholds were tuned on the 60-item seed set only (`scripts/tune-seed.ts`, which never imports the held-out
file). Run it yourself with `npm run eval`.

**Honest caveats.** 20 items is small: one item is 5 percentage points. The same author (AI-assisted, see README)
wrote the seed set, the held-out set and the cue patterns in one session, and the spec's synonym list (e.g.
"fringe", "explored set", "cost-so-far", "overshoots") was chosen to cover held-out vocabulary. So these numbers
are a sanity check on these synthetic examples. Accuracy when answered uses only items with a clear gold
label. Of 16 issued labels, 15 match the gold label across the full set.

## Run 1 (frozen, do not edit)

Date: 2026-11-20. Commit: `f5a6f56`. Engine: Sample. Command: `npm run eval`.

```
Office Hours Heatmap eval: engine=sample items=20 commit=f5a6f56 at=2026-11-20T23:04:34.897Z
Synthetic held-out set, 20 items: small, indicative only.

┌────────────────────────────┬──────────┬─────────────────────┐
│ (index)                    │ value    │ detail              │
├────────────────────────────┼──────────┼─────────────────────┤
│ Overall agreement          │ '90.0%'  │ '18/20'             │
│ Accuracy when answered     │ '100.0%' │ '15/15'             │
│ Coverage                   │ '93.8%'  │ '15/16'             │
│ Abstain rate               │ '20.0%'  │ '4/20'              │
│ Ambiguous caught           │ '75.0%'  │ '3/4'               │
│ Naive by-question baseline │ '30.0%'  │ 'overall agreement' │
└────────────────────────────┴──────────┴─────────────────────┘
Thresholds: {"TAU":0.3,"DELTA":0.12,"MIX":0.45,"MIN_WORDS":5,"W_CUE":0.65,"W_SIM":0.35}

Confusion (rows = gold, cols = predicted):
gold \ pred                      goal admiss    any      g closed bigger abstai
goal-test-on-generation             2      0      0      0      0      0      1
admissible-means-consistent         0      3      0      0      0      0      0
any-heuristic-optimal               0      0      3      0      0      0      0
g-h-swapped                         0      0      0      3      0      0      0
closed-never-reopened               0      0      0      0      2      0      0
bigger-h-always-better              0      0      0      0      0      2      0
abstain                             0      0      0      0      1      0      3

Misses (2):
- h01 [Q2] gold=goal-test-on-generation predicted=abstain (No misconception matched strongly)
    "the moment the target landed on the fringe I called it done, but the key pops two more nodes first"
- h19 [Q3] gold=abstain predicted=closed-never-reopened
    "I thought it never overshoots so the explored nodes are final, not sure which part is wrong"
```

## Later runs

(Appended below; Run 1 above stays as recorded.)

### Run 2: 2026-11-20, commit `c4bc6ca`

After adding TA exemplars to the Sample engine: identical numbers to Run 1 (overall 18/20, accuracy when
answered 15/15, coverage 15/16, abstain 4/20, ambiguous caught 3/4, baseline 30.0%). The eval uses a clean
engine without exemplars.

### Run 3: 2026-11-21, commit `50f182a`

Command: `npm run eval`. Same unchanged 20 authored cases and classifier; this revision changes reporting,
not the frozen run above. This is an authored challenge set and is not independent validation.

| Metric | Result | Denominator |
|---|---|---|
| Overall agreement | 18/20 (90%) | All cases, abstain treated as a label |
| Issued-label precision | 15/16 (93.75%) | All non-abstain predictions, including the false positive on ambiguous h19 |
| Clear-gold conditional accuracy | 15/15 (100%) | Answered cases with non-abstain gold only |
| Coverage | 15/16 (93.75%) | Clear-gold cases |
| Abstain rate | 4/20 (20%) | All cases |
| Ambiguous caught | 3/4 (75%) | Ambiguous-gold cases |
| By-question baseline agreement | 6/20 (30%) | All cases |

Misses remain h01 (missed paraphrase, abstained) and h19 (ambiguous gold, issued closed-never-reopened).
Unavailable denominators return null for precision, coverage and conditional accuracy. No evidence here
establishes student learning gains. Keep the conditional 15/15 distinct from the all-issued 15/16.

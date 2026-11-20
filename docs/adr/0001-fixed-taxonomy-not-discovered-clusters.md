# 0001: Assign to a fixed TA-owned taxonomy instead of discovering clusters

Status: accepted (2026-11-20)

The engine assigns each stuck report to one misconception from a TA-owned taxonomy, or abstains; it never
creates a new group. We give up the "AI finds groups you didn't know about" wow factor in exchange for
groups a TA recognises instantly, assignments we can score against gold labels, and a deterministic offline
engine. New confusions surface through the review queue instead, where a human names them.

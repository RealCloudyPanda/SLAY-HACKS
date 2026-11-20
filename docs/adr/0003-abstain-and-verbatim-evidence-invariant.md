# 0003: Abstain is a first-class outcome, and evidence must be verbatim

Status: accepted (2026-11-20)

Every engine may return "abstain", and any result whose evidence excerpt is not an exact substring of the
stuck report is converted to abstain by the shared validator. This lowers coverage (more reports go to the
review queue) in exchange for never showing a TA a confident group backed by invented evidence. The
dashboard, ranking and eval all treat abstain as a real label, so removing it later would ripple everywhere.

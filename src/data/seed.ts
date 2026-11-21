import type { LabelledItem, Label, QuestionId } from "@/domain/types";


const raw: [QuestionId, Label, string][] = [

  ["Q2", "goal-test-on-generation", "I returned the path as soon as the goal showed up in the frontier, why is that wrong"],
  ["Q2", "goal-test-on-generation", "my trace stops when G gets pushed with f=9 but the answer key keeps going"],
  ["Q2", "goal-test-on-generation", "I stopped the search the moment the goal was added to the open list, isn't finding it enough?"],
  ["Q2", "goal-test-on-generation", "why do we keep expanding after the goal is already in the queue, we found it"],
  ["Q2", "goal-test-on-generation", "I ended my trace when I generated the goal node, the solution has two more expansions after that"],
  ["Q4", "goal-test-on-generation", "in Q4 i quit as soon as the goal got generated so my path cost is 12 not 10"],
  ["Q4", "goal-test-on-generation", "I thought A* is done once the goal is added to the open list, so I never expanded the cheaper node"],
  ["Q4", "goal-test-on-generation", "the goal appeared as a successor of C so I returned that path immediately, apparently that's not optimal"],
  ["Q4", "goal-test-on-generation", "I check for the goal when I generate children, the key checks when it's popped and I don't get why it matters"],
  ["Q5", "goal-test-on-generation", "for weighted A* I stopped when the goal was first generated, is that the reason my answer differs"],
  ["Q5", "goal-test-on-generation", "I returned as soon as the goal was pushed onto the queue, didn't wait for it to be expanded"],
  ["Q5", "goal-test-on-generation", "doesnt the search end the second you see the goal? my Q5 trace stops at generation"],
  ["Q5", "goal-test-on-generation", "I said the path is whatever we have when the goal gets added to the open list"],
  ["Q5", "goal-test-on-generation", "not sure why you have to wait to pop the goal, I stopped when it was generated"],


  ["Q1", "admissible-means-consistent", "I said Manhattan is consistent because it's admissible, isn't that the same thing"],
  ["Q1", "admissible-means-consistent", "I thought admissible and consistent were two words for never overestimating"],
  ["Q1", "admissible-means-consistent", "straight-line distance is admissible so I wrote it's consistent too, got marked wrong"],
  ["Q1", "admissible-means-consistent", "what's even the difference between admissible and consistent, I treated them as the same"],
  ["Q3", "admissible-means-consistent", "for Q3 I just checked h never overestimates and called it consistent"],
  ["Q3", "admissible-means-consistent", "I showed h is admissible so I concluded it's consistent, the key wants something about edges"],
  ["Q3", "admissible-means-consistent", "isn't every admissible heuristic consistent? that's what I assumed in Q3"],
  ["Q3", "admissible-means-consistent", "i compared each h to the true distance to goal and said consistent, apparently thats admissibility"],
  ["Q3", "admissible-means-consistent", "I used admissible and consistent interchangeably and lost marks, they sound identical to me"],
  ["Q4", "admissible-means-consistent", "the question says h is admissible but not consistent and I don't see how that's possible"],
  ["Q4", "admissible-means-consistent", "if h never overestimates how can it fail to be consistent, I thought admissible means consistent"],


  ["Q1", "any-heuristic-optimal", "I said it doesn't matter which heuristic we pick since A* always finds the optimal path"],
  ["Q2", "any-heuristic-optimal", "I assumed A* gives the shortest path no matter what h values are in the table"],
  ["Q5", "any-heuristic-optimal", "for Q5 I assumed weighted A* still gives the shortest path since it's still A*"],
  ["Q5", "any-heuristic-optimal", "A* is optimal so weighted A* is optimal too, I don't see what changes"],
  ["Q5", "any-heuristic-optimal", "I wrote yes it's guaranteed optimal because A* is always optimal with any heuristic"],
  ["Q5", "any-heuristic-optimal", "I thought A* is optimal regardless of the heuristic, so doubling h shouldn't matter"],
  ["Q5", "any-heuristic-optimal", "my answer was that any A* variant returns the optimal path, the key says no"],
  ["Q5", "any-heuristic-optimal", "isnt A* always optimal? thats the whole point of A* I thought"],


  ["Q2", "g-h-swapped", "I added the heuristic of the parent instead of the path cost so my f values are all off"],
  ["Q2", "g-h-swapped", "I mixed up g and h, I used h as the cost so far and g as the guess"],
  ["Q2", "g-h-swapped", "my f values are wrong because I summed the two heuristic values instead of g plus h"],
  ["Q2", "g-h-swapped", "I think I swapped g(n) and h(n) in the table, my expansion order is completely different"],
  ["Q3", "g-h-swapped", "I used g(n) where the formula needs h(n) when checking the edges in Q3"],
  ["Q3", "g-h-swapped", "I was confused which one is the cost so far, g or h, so I wrote them backwards"],
  ["Q4", "g-h-swapped", "for Q4 I computed f as h plus h of the parent, I think I don't get what g is"],
  ["Q4", "g-h-swapped", "I put the path cost in the h column and the estimate in the g column by mistake"],


  ["Q2", "closed-never-reopened", "once B is in the closed set I skipped it, I didn't know you'd ever look at it again"],
  ["Q4", "closed-never-reopened", "I thought once a node is closed its cost is final, so I ignored the cheaper path to D"],
  ["Q4", "closed-never-reopened", "why would you ever reopen a closed node? I never touch closed nodes again"],
  ["Q4", "closed-never-reopened", "found a cheaper path to E but E was already in the closed list so i threw it away"],
  ["Q4", "closed-never-reopened", "I assumed nodes in the closed set can never get a better g value"],
  ["Q4", "closed-never-reopened", "my graph search never revisits closed nodes so I got the suboptimal path, I thought that was the rule"],
  ["Q4", "closed-never-reopened", "the key reopens node C after it was closed, I didnt know that was allowed"],


  ["Q1", "bigger-h-always-better", "I picked the heuristic with the bigger numbers because bigger means more informed right"],
  ["Q1", "bigger-h-always-better", "I said straight-line times 3 is best because a larger heuristic is always better"],
  ["Q5", "bigger-h-always-better", "doubling h makes it bigger so it should be better, more informed heuristics are always better"],
  ["Q5", "bigger-h-always-better", "I thought a larger h always helps since it expands fewer nodes, so 2h is strictly better"],
  ["Q5", "bigger-h-always-better", "bigger heuristic values mean a better heuristic, even if it overestimates a bit"],


  ["Q1", "abstain", "honestly the whole grid thing confused me, I didn't know where to start"],
  ["Q3", "abstain", "I got lost in the table, too many numbers to keep track of"],
  ["Q4", "abstain", "honestly Q4 just lost me"],
  ["Q4", "abstain", "I thought consistent and admissible were the same so I didn't reopen the closed node"],
  ["Q4", "abstain", "my answer was close but not the same as the key, not sure which step was wrong"],
  ["NS", "abstain", "I don't really get A* at all, the lecture went too fast"],
  ["NS", "abstain", "everything about heuristics feels vague to me, can we go over the basics"],
];

export const SEED: readonly LabelledItem[] = raw.map(([questionId, gold, text], i) => ({
  id: `s${String(i + 1).padStart(2, "0")}`,
  questionId,
  text,
  gold,
}));

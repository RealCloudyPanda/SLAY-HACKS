import { describe, expect, it } from 'vitest';
import { cleanSampleEngine } from '@/engine/sample/classify';



export const REVIEW_CASES = [
  'A bigger monitor is always better so I chose the largest one',
  'Once the ticket is closed I never reopen it or revisit the final decision',
  'My writing is consistent and I never overestimate my ability',
  'A* stops when the goal is popped, not when generated',
  'Admissible does not imply consistent; I need to check the edge inequality',
  'A larger heuristic is not always better because it may overestimate',
  'A* is not guaranteed optimal with any heuristic',
  'A closed node can be reopened if a cheaper path is found',
  'g is the path cost and h is the estimate, not the other way around',
  'I now understand that admissible and consistent are different conditions',
  'I must reopen the closed node when its path cost improves',
  'A* tests the goal on removal rather than generation',
];

describe('ambiguous correction and off-topic language', () => {
  it.each(REVIEW_CASES)('routes to review without a misleading quote: %s', (text) => {
    const result = cleanSampleEngine.classify(text);
    expect(result.misconceptionId).toBe('abstain');
    expect(result.evidenceExcerpt).toBe('');
    expect(result.candidates).toEqual([]);
    expect(result.reason).toBeTruthy();
  });
});

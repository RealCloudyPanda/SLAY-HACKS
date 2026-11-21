import type { MisconceptionId } from '@/domain/types';
import { normalize } from './normalize';


const CONTEXT: Record<MisconceptionId, RegExp> = {
  'goal-test-on-generation': /\b(goal|target|openlist|search|node|trace)\b/,
  'admissible-means-consistent': /\badmissib\w*|\bheuristic\w*|\bhcost\b|\bh\b|\bmanhattan\b|\bedges?\b/,
  'any-heuristic-optimal': /\bheuristic\w*|\bhcost\b|\bh\b|\bsearch\b/,
  'g-h-swapped': /\b(gcost|hcost|fcost|heuristic)\b|\bg\b.{0,35}\bh\b|\bh\b.{0,35}\bg\b/,
  'closed-never-reopened': /\b(closedset|nodes?|gcost|search|graph)\b|\b(cheaper|better)\b.{0,15}\b(path|route)\b/,
  'bigger-h-always-better': /\b(heuristic\w*|hcost|h|2h)\b/,
};



const QUALIFIED = [
  /\bnot\s+(?:always|necessarily|guaranteed|the same|equivalent|when|the other way)\b/,
  /\b(?:does not|doesn't|doesnt|cannot|can't)\s+(?:imply|mean|guarantee)\b/,
  /\b(?:can|must|should|may|need to)\s+(?:be\s+)?reopen\w*\b/,
  /\b(?:rather than|instead of)\s+(?:when\s+)?generat\w*\b/,
  /\b(?:now|finally)\s+(?:i\s+)?(?:understand|know|realise|realize)\b/,
];

export function reviewReason(text: string, id: MisconceptionId): string | undefined {
  const normalized = normalize(text);
  if (!CONTEXT[id].test(normalized) && !(id === 'any-heuristic-optimal' && /\ba\*/i.test(text))) return 'Matching words lack enough A* context; TA review needed';
  if (QUALIFIED.some((pattern) => pattern.test(normalized)))
    return 'Report qualifies or corrects a belief; TA review needed';
  return undefined;
}

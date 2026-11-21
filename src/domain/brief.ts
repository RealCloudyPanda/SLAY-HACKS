import { teachFirst, type Labelled } from './ranking';
import { taxonomyEntry } from './taxonomy';
import type { MisconceptionId, StuckReport } from './types';

export interface BriefInput { reports: StuckReport[]; names: { id: MisconceptionId; name: string }[] }
/** Rebuild from current assignments so moves, rejection, rename and reset cannot leave stale evidence. */
export function teachingBrief(input: BriefInput, selected: MisconceptionId[]) {
  const labelled: Labelled[] = input.reports.map((r) => ({ questionId: r.questionId, label: r.assignment.label, source: r.assignment.source }));
  const ranked = teachFirst(labelled);
  return {
    reviewCount: input.reports.filter((r) => r.assignment.label === 'abstain').length,
    reportCount: input.reports.length,
    concepts: [...new Set(selected)].slice(0, 2).map((id) => {
      const item = ranked.find((row) => row.id === id)!;
      const reports = input.reports.filter((r) => r.assignment.label === id);
      return {
        ...item,
        name: input.names.find((m) => m.id === id)?.name ?? id,
        teachingHint: taxonomyEntry(id).teachingHint,
        provisional: reports.filter((r) => r.assignment.source === 'ai').length,
        evidence: reports.map((r) => ({ id: r.id, questionId: r.questionId, text: r.text, excerpt: r.assignment.evidenceExcerpt, status: r.assignment.source === 'ai' ? 'provisional' : 'TA checked' })),
      };
    }),
  };
}

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

const inline = (text: string): string => text.replace(/[\r\n]+/g, ' ').replace(/([\\`*_[\]<>])/g, '\\$1');
export function briefMarkdown(concepts: ReturnType<typeof teachingBrief>['concepts'], reviewCount: number, reportCount: number): string {
  return [
    '# Teaching brief', '',
    `${reportCount} reports · ${reviewCount} waiting for review. Counts are reports, not unique students.`,
    'Authored A* demo; provisional assignments need human review.', '',
    ...concepts.flatMap((item) => [
      `## ${inline(item.name)}`, '',
      `${item.count} supporting reports · ${item.confirmed} TA checked · ${item.provisional} provisional.`,
      `What to say: ${inline(item.teachingHint)}`, '',
      ...item.evidence.flatMap((e) => [
        `- ${e.questionId} · ${inline(e.id)} · ${e.status}: “${inline(e.excerpt || e.text)}”${e.excerpt ? '' : ' (full report; no retained model excerpt)'}`,
      ]), '',
    ]),
  ].join('\n');
}

import type { teachingSnapshot } from './teachingSnapshot';

const inline = (text: string): string => text.replace(/[\r\n]+/g, ' ').replace(/([\\`*_[\]<>])/g, '\\$1');
export function briefMarkdown(concepts: ReturnType<ReturnType<typeof teachingSnapshot>['brief']>['concepts'], reviewCount: number, reportCount: number): string {
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

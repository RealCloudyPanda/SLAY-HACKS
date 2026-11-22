import { compare, compareSentence } from './compare';
import { heatmap } from './heatmap';
import { teachFirst } from './ranking';
import { taxonomyEntry } from './taxonomy';
import { QUESTION_IDS, type Correction, type Misconception, type MisconceptionId, type StuckReport } from './types';

type TeachingState = {
  reports: StuckReport[];
  misconceptions: Misconception[];
  corrections: Correction[];
  engine: { kind: 'sample' | 'live'; model?: string };
};

export function teachingSnapshot(input: TeachingState) {
  const s = structuredClone(input);
  const names = new Map(s.misconceptions.map((m) => [m.id, m.name]));
  const nameOf = (id: MisconceptionId) => names.get(id) ?? id;
  const labelled = s.reports.map((r) => ({ questionId: r.questionId, label: r.assignment.label, source: r.assignment.source }));
  const ranked = teachFirst(labelled);
  const review = s.reports.filter((r) => r.assignment.label === 'abstain');
  const all = s.misconceptions.map(({ id, name }) => ({ id, name }));
  const concepts = ranked.map((item) => {
    const reports = s.reports.filter((r) => r.assignment.label === item.id);
    return {
      ...item,
      name: nameOf(item.id),
      teachingHint: taxonomyEntry(item.id).teachingHint,
      provisional: reports.filter((r) => r.assignment.source === 'ai').length,
      evidence: reports.map((r) => ({ id: r.id, questionId: r.questionId, text: r.text, excerpt: r.assignment.evidenceExcerpt, status: r.assignment.source === 'ai' ? 'provisional' : 'TA checked' })),
    };
  });
  return {
    brief(selected: MisconceptionId[]) {
      return structuredClone({ reviewCount: review.length, reportCount: s.reports.length, concepts: [...new Set(selected)].slice(0, 2).map((id) => concepts.find((c) => c.id === id)!) });
    },
    dashboard() {
      const hm = heatmap(labelled, ranked.map((t) => t.id));
      return structuredClone({
        briefOptions: concepts.filter((c) => c.count > 0),
        totals: { reports: s.reports.length, assigned: s.reports.length - review.length, review: review.length, corrected: s.reports.filter((r) => r.assignment.source !== 'ai').length },
        teachFirst: ranked.map((t) => ({ ...t, name: nameOf(t.id) })),
        heatmap: { ...hm, rows: hm.rows.map((r) => ({ ...r, name: nameOf(r.id) })) },
        recentCorrections: s.corrections.slice(0, 8).map((c) => ({ ...c,
          text: c.reportId ? s.reports.find((r) => r.id === c.reportId)?.text : undefined,
          fromName: c.from && c.from !== 'abstain' ? nameOf(c.from) : c.from,
          toName: c.to && c.to !== 'abstain' ? nameOf(c.to) : c.to,
          misconceptionName: c.misconceptionId ? nameOf(c.misconceptionId) : undefined,
        })),
        engine: s.engine,
      });
    },
    cluster(id: MisconceptionId) {
      const reports = s.reports.filter((r) => r.assignment.label === id).sort((a, b) => b.assignment.confidence - a.assignment.confidence || a.id.localeCompare(b.id));
      return structuredClone({ misconception: s.misconceptions.find((m) => m.id === id)!, reports,
        countsByQuestion: QUESTION_IDS.map((questionId) => ({ questionId, count: reports.filter((r) => r.questionId === questionId).length })), all });
    },
    review() { return structuredClone({ reports: review, misconceptions: all }); },
    compare() {
      const c = compare(labelled);
      return structuredClone({ ...c,
        byMisconception: c.byMisconception.map((m) => ({ ...m, name: nameOf(m.id) })),
        topQuestionMix: c.topQuestionMix.map((m) => ({ ...m, name: m.label === 'abstain' ? 'Needs review' : nameOf(m.label) })),
        topQuestionIdeaName: c.topQuestionIdea ? nameOf(c.topQuestionIdea) : null,
        sentence: compareSentence(c, nameOf),
      });
    },
  };
}

export type TeachingConcept = ReturnType<ReturnType<typeof teachingSnapshot>['brief']>['concepts'][number];

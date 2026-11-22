import { beforeEach, expect, it } from 'vitest';
import { teachingSnapshot } from '@/domain/teachingSnapshot';
import { state, store } from '@/store/memory';

const id = 'goal-test-on-generation' as const;
beforeEach(() => store.reset());

it('keeps all views coherent after every correction and reset', () => {
  const report = store.submit('Q4', 'I got really lost in the middle');
  const check = () => {
    const snapshot = teachingSnapshot(state());
    const dashboard = snapshot.dashboard();
    const compare = snapshot.compare();
    expect(snapshot.review().reports).toHaveLength(dashboard.totals.review);
    expect(dashboard.totals.assigned + dashboard.totals.review).toBe(dashboard.totals.reports);
    for (const row of dashboard.teachFirst) {
      const cluster = snapshot.cluster(row.id);
      expect(cluster.reports).toHaveLength(row.count);
      expect(cluster.misconception.name).toBe(row.name);
      expect(snapshot.review().misconceptions.find((m) => m.id === row.id)?.name).toBe(row.name);
      expect(compare.byMisconception.find((m) => m.id === row.id)).toMatchObject({ name: row.name, count: row.count });
      expect(dashboard.heatmap.rows.find((r) => r.id === row.id)?.cells.reduce((n, c) => n + c.count, 0)).toBe(row.count);
      if (row.count > 0) {
        const concept = snapshot.brief([row.id]).concepts[0];
        expect(dashboard.briefOptions.find((c) => c.id === row.id)).toEqual(concept);
        expect(concept.evidence.map((e) => e.id).sort()).toEqual(cluster.reports.map((r) => r.id).sort());
        expect(concept.confirmed + concept.provisional).toBe(row.count);
      }
    }
    return snapshot;
  };
  expect(check().review().reports.some((r) => r.id === report.id)).toBe(true);
  store.move(report.id, id);
  expect(check().brief([id]).concepts[0].evidence.find((e) => e.id === report.id)).toMatchObject({ status: 'TA checked', excerpt: '' });
  store.rename(id, 'Pop the goal before stopping');
  expect(check().cluster(id).misconception.name).toBe('Pop the goal before stopping');
  store.confirm(report.id);
  check();
  store.reject(report.id);
  expect(check().review().reports.find((r) => r.id === report.id)?.assignment.source).toBe('ta-rejected');
  store.reset();
  expect(check().cluster(id).misconception.name).not.toBe('Pop the goal before stopping');
});

it('captures names, source status and reports without later global reads', () => {
  const snapshot = teachingSnapshot(state());
  const before = snapshot.dashboard();
  store.rename(id, 'New title');
  store.reject(snapshot.cluster(id).reports[0].id);
  expect(snapshot.dashboard()).toEqual(before);
  expect(snapshot.cluster(id).misconception.name).not.toBe('New title');
  expect(teachingSnapshot(state()).cluster(id).misconception.name).toBe('New title');
  store.reset();
  expect(snapshot.dashboard()).toEqual(before);
});

it('isolates returned views from caller mutation', () => {
  const snapshot = teachingSnapshot(state());
  const before = snapshot.dashboard();
  const view = snapshot.dashboard();
  view.briefOptions[0].name = 'Changed title';
  view.briefOptions[0].evidence.length = 0;
  snapshot.brief([id]).concepts[0].name = 'Changed brief';
  snapshot.cluster(id).misconception.name = 'Changed misconception';
  snapshot.cluster(id).reports[0].assignment.label = 'abstain';
  snapshot.review().reports.length = 0;
  snapshot.review().misconceptions[0].name = 'Changed review';
  expect(snapshot.dashboard()).toEqual(before);
  expect(snapshot.brief([id]).concepts[0]).toEqual(before.briefOptions.find((c) => c.id === id));
});

import { teachingSnapshot } from '@/domain/teachingSnapshot';
import { beforeEach, expect, it } from 'vitest';
import { briefMarkdown } from '@/domain/brief';
import { state, store } from '@/store/memory';
const id = 'goal-test-on-generation' as const;
const brief = () => teachingSnapshot(state()).brief([id]);
beforeEach(() => store.reset());
it('refreshes hints, checked counts and display names after review actions', () => {
  const report = store.submit('Q2', 'I stopped as soon as the goal was added to the open list');
  const before = brief().concepts[0];
  store.confirm(report.id);
  store.rename(id, 'Wait until the goal is popped');
  const after = brief().concepts[0];
  expect(after.confirmed).toBe(before.confirmed + 1);
  expect(after.provisional).toBe(before.provisional - 1);
  expect(after.name).toBe('Wait until the goal is popped');
  expect(after.teachingHint).toContain('popped');
  expect(after.evidence.find((r) => r.id === report.id)?.status).toBe('TA checked');
  store.reject(report.id);
  expect(brief().concepts[0].evidence.some((r) => r.id === report.id)).toBe(false);
  expect(brief().reviewCount).toBeGreaterThan(0);
  store.reset();
  expect(brief().concepts[0].name).not.toBe(after.name);
});
it('deduplicates selections and caps briefs at two concepts', () => {
  const snapshot = teachingSnapshot(state());
  expect(snapshot.brief([id, id]).concepts).toHaveLength(1);
  expect(snapshot.brief(state().misconceptions.map((m) => m.id)).concepts).toHaveLength(2);
});

it('escapes Markdown metacharacters and includes source status and remaining review', () => {
  const item = brief().concepts[0];
  item.name = 'Heading [unsafe](target) <script>'; 
  item.evidence = [{ id: 'one', questionId: 'Q2', text: 'full report', excerpt: 'a *claim*\nnext line', status: 'provisional' }];
  const md = briefMarkdown([item], 4, 60);
  expect(md).toContain('60 reports · 4 waiting for review');
  expect(md).toContain('What to say:');
  expect(md).toContain('Q2 · one · provisional');
  expect(md).toContain('a \\*claim\\* next line');
  expect(md).not.toContain('<script>');
  expect(md).not.toContain('[unsafe](target)');
});

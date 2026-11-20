import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { beforeEach, expect, it } from "vitest";
import { GET, POST } from "@/app/api/trpc/[trpc]/route";
import { store } from "@/store/memory";
import type { AppRouter } from "@/trpc/routers/_app";

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({
    url: "http://demo.test/api/trpc",
    fetch: (url, init) => {
      const request = new Request(url, init);
      return request.method === "POST" ? POST(request) : GET(request);
    },
  })],
});

beforeEach(() => store.reset());

it("routes a student report to the TA dashboard and cluster with redacted verbatim evidence", async () => {
  const id = "goal-test-on-generation";
  const questionId = "Q2";
  const heatCount = (summary: Awaited<ReturnType<typeof client.dashboard.summary.query>>) =>
    summary.heatmap.rows.find((row) => row.id === id)?.cells.find((cell) => cell.questionId === questionId)?.count ?? 0;
  const before = await client.dashboard.summary.query();
  const report = "I stopped as soon as the goal was added to the open list. Email demo@example.test";
  await expect(client.report.submit.mutate({ questionId, text: report })).resolves.toEqual({ ok: true });

  const [dashboard, cluster] = await Promise.all([
    client.dashboard.summary.query(),
    client.cluster.byId.query({ id }),
  ]);
  expect(dashboard.totals.reports).toBe(before.totals.reports + 1);
  expect(heatCount(dashboard)).toBe(heatCount(before) + 1);
  const submitted = cluster.reports.find((item) => item.text.includes("Email [email]"));
  expect(submitted?.questionId).toBe(questionId);
  const excerpt = submitted?.assignment.evidenceExcerpt;
  expect(excerpt).toBeTruthy();
  expect(submitted?.text).toContain(excerpt);
  expect(submitted?.text).not.toContain("demo@example.test");
});

it("moves an abstention out of review and updates the dashboard, compare view, and correction log", async () => {
  const text = "I got really lost in the middle";
  const to = "goal-test-on-generation";
  await client.report.submit.mutate({ questionId: "Q4", text });
  const [before, review, compare] = await Promise.all([
    client.dashboard.summary.query(),
    client.review.list.query(),
    client.compare.get.query(),
  ]);
  const report = review.reports.find((item) => item.text === text)!;
  await client.correction.move.mutate({ reportId: report.id, to });

  const [after, updatedReview, updatedCompare] = await Promise.all([
    client.dashboard.summary.query(),
    client.review.list.query(),
    client.compare.get.query(),
  ]);
  expect(after.totals.review).toBe(before.totals.review - 1);
  expect(after.totals.assigned).toBe(before.totals.assigned + 1);
  expect(updatedReview.reports.some((item) => item.id === report.id)).toBe(false);
  expect(updatedCompare.reach.byMisconception).toBe(compare.reach.byMisconception + 1);
  expect(after.recentCorrections[0]).toMatchObject({ kind: "move", reportId: report.id, to });
});

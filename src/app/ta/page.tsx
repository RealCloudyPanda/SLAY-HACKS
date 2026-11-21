"use client";
import { TeachingBrief } from "@/components/TeachingBrief";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { Heatmap } from "@/components/Heatmap";
import { RecentCorrections } from "@/components/RecentCorrections";
import { RerunControls } from "@/components/RerunControls";
import { TeachFirstList } from "@/components/TeachFirstList";
import { useTRPC } from "@/trpc/client";

export default function Dashboard() {
  const trpc = useTRPC();
  const q = useQuery(trpc.dashboard.summary.queryOptions());
  const d = q.data;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="spread">
        <div className="stack" style={{ gap: 6 }}>
          <h1>What to explain first</h1>
          {d ? (
            <div className="totals">
              <span>
                <b>{d.totals.reports}</b> stuck reports
              </span>
              <span>
                <b>{d.totals.assigned}</b> grouped
              </span>
              <span>
                <b>{d.totals.review}</b> <Link href="/ta/review">waiting for review</Link>
              </span>
              <span>
                <b>{d.totals.corrected}</b> checked by a TA
              </span>
            </div>
          ) : (
            <div className="totals">Loading reports…</div>
          )}
        </div>
        <div className="toolbar">
          <button className="btn btn-sm" onClick={() => q.refetch()} disabled={q.isFetching}>
            {q.isFetching ? "Refreshing…" : "Refresh"}
          </button>
          <RerunControls />
        </div>
      </div>

      <section className="panel panel-body stack" aria-labelledby="try-flow">
        <h2 id="try-flow">Try the real flow</h2>
        <p className="muted">This A* demo starts with authored reports. Submit a fresh sentence to see the same flow with your own input.</p>
        <ol>
          <li><Link href="/submit">Submit a fresh report</Link>, for example “I got really lost in the middle.”</li>
          <li><Link href="/ta/review">Open review</Link>; that vague sentence should abstain. Move it only after deciding which concept it supports.</li>
          <li>Refresh this dashboard, select one or two concepts below, and export the updated teaching brief.</li>
        </ol>
        <p className="small muted">Labels remain provisional until checked. Counts represent reports; there is no student identity or unique-person estimate.</p>
      </section>

      {q.error ? <div className="banner banner-warn">Couldn&apos;t load the dashboard: {q.error.message}</div> : null}

      {d && d.totals.reports === 0 ? (
        <div className="panel">
          <EmptyState title="No stuck reports yet">
            Share <Link href="/submit">the student form</Link>. Reports appear here as they arrive, grouped by misconception.
          </EmptyState>
        </div>
      ) : d ? (
        <>
          <div className="dash">
            <section className="panel" aria-labelledby="tf-h">
              <div className="panel-head">
                <h2 id="tf-h">Teach-first list</h2>
                <span className="small muted">ranked by supporting reports</span>
              </div>
              <TeachFirstList items={d.teachFirst} />
            </section>
            <section className="panel" aria-labelledby="hm-h">
              <div className="panel-head">
                <h2 id="hm-h">Misconception × question</h2>
                <Link className="small" href="/ta/compare">
                  Why not just sort by question?
                </Link>
              </div>
              <div className="panel-body">
                <Heatmap rows={d.heatmap.rows} />
              </div>
            </section>
          </div>
          <TeachingBrief options={d.briefOptions} reviewCount={d.totals.review} reportCount={d.totals.reports} />
          <section className="panel" aria-labelledby="rc-h">
            <div className="panel-head">
              <h2 id="rc-h">Recent corrections</h2>
              <span className="small muted">last 8</span>
            </div>
            <RecentCorrections items={d.recentCorrections} />
          </section>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { QuestionMixBar } from "@/components/QuestionMixBar";
import { ReachStat } from "@/components/ReachStat";
import { joinQuestions } from "@/domain/ranking";
import { questionLabel } from "@/domain/questions";
import { useTRPC } from "@/trpc/client";

export default function ComparePage() {
  const trpc = useTRPC();
  const q = useQuery(trpc.compare.get.queryOptions());
  if (!q.data) return <p className="muted">{q.error ? q.error.message : "Loading…"}</p>;
  const c = q.data;
  const first = c.byMisconception[0];
  const maxQ = Math.max(1, ...c.byQuestion.map((b) => b.count));
  const tq = c.topQuestion ? questionLabel(c.topQuestion) : "–";

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1>Question number or misconception?</h1>
        <p className="muted" style={{ maxWidth: "70ch" }}>
          The same reports, grouped two ways. The number that matters: how many students your first explanation reaches.
        </p>
      </div>
      <p className="conclusion">{c.sentence}</p>

      <div className="cmp">
        <section className="cmp-col" aria-labelledby="byq">
          <h2 id="byq">Grouped by question number</h2>
          <ReachStat
            n={c.reach.byQuestion}
            label={`First explanation reaches`}
            detail={c.topQuestionIdeaName ? `students: the most common idea inside ${tq} is “${c.topQuestionIdeaName}”` : "students"}
            win={c.reach.byQuestion > c.reach.byMisconception}
          />
          <div className="panel panel-body stack">
            <h3>Reports per question</h3>
            <ul className="qrank">
              {c.byQuestion.map((b) => (
                <li key={b.questionId}>
                  <span className="mono">{questionLabel(b.questionId)}</span>
                  <span className="qbar" aria-hidden>
                    <span style={{ width: `${(b.count / maxQ) * 100}%` }} />
                  </span>
                  <span className="num" style={{ textAlign: "right" }}>{b.count}</span>
                </li>
              ))}
            </ul>
          </div>
          {c.topQuestion ? (
            <div className="panel panel-body stack">
              <h3>Inside {tq}: {c.topQuestionMix.length} different ideas</h3>
              <QuestionMixBar mix={c.topQuestionMix} highlight={first?.id} />
            </div>
          ) : null}
        </section>

        <section className="cmp-col" aria-labelledby="bym">
          <h2 id="bym">Grouped by misconception</h2>
          <ReachStat
            n={c.reach.byMisconception}
            label="First explanation reaches"
            detail={first ? `students across ${joinQuestions(first.questions)}: “${first.name}”` : "students"}
            win={c.reach.byMisconception >= c.reach.byQuestion}
          />
          <div className="panel">
            <ol className="tf-list">
              {c.byMisconception.map((m, i) => (
                <li key={m.id} className={`tf-item ${m.count === 0 ? "tf-zero" : ""}`}>
                  <Link className="tf-link" href={`/ta/m/${m.id}`}>
                    <span className="tf-rank">{String(i + 1).padStart(2, "0")}</span>
                    <span className="tf-name">{m.name}</span>
                    <span className="tf-count">{m.count}</span>
                    <span className="tf-reason">{m.reason}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
      <p className="note">Computed live from the current labels, including your corrections. The sentence above is a fixed template filled with these numbers, not AI-written.</p>
    </div>
  );
}

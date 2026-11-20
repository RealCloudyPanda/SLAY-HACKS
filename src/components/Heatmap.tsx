import Link from "next/link";
import { questionLabel } from "@/domain/questions";
import { QUESTION_IDS, type MisconceptionId, type QuestionId } from "@/domain/types";

export interface HeatRowView {
  id: MisconceptionId;
  name: string;
  total: number;
  cells: { questionId: QuestionId; count: number; step: number }[];
}

export function Heatmap({ rows }: { rows: HeatRowView[] }) {
  return (
    <div className="stack" style={{ gap: 12 }}>
      <table className="heat">
        <caption className="sr-only">Reports by misconception (rows, teach-first order) and homework question (columns)</caption>
        <thead>
          <tr>
            <th scope="col" className="rowh">
              <span className="sr-only">Misconception</span>
            </th>
            {QUESTION_IDS.map((q) => (
              <th scope="col" key={q} className="mono">
                {q === "NS" ? "?" : q}
                {q === "NS" ? <span className="sr-only">Not sure</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.total === 0 ? "zero" : ""}>
              <th scope="row" className="rowh">
                <Link href={`/ta/m/${r.id}`}>{r.name}</Link>
              </th>
              {r.cells.map((c) => (
                <td key={c.questionId}>
                  <Link
                    href={`/ta/m/${r.id}#${c.questionId}`}
                    className={`cell h${c.step}`}
                    aria-label={`${r.name}, ${questionLabel(c.questionId)}: ${c.count} report${c.count === 1 ? "" : "s"}`}
                  >
                    {c.count}
                  </Link>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="legend" aria-hidden>
        fewer
        {[1, 2, 3, 4, 5].map((s) => (
          <i key={s} style={{ background: `var(--heat-${s})` }} />
        ))}
        more · every cell also shows its count
      </div>
    </div>
  );
}

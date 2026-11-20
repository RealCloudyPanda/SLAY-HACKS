import Link from "next/link";
import type { MisconceptionId, QuestionId } from "@/domain/types";

export interface TeachFirstRow {
  id: MisconceptionId;
  name: string;
  count: number;
  questions: QuestionId[];
  confirmed: number;
  reason: string;
}

export function TeachFirstList({ items }: { items: TeachFirstRow[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ol className="tf-list">
      {items.map((it, i) => (
        <li key={it.id} className={`tf-item ${it.count === 0 ? "tf-zero" : ""}`}>
          <Link className="tf-link" href={`/ta/m/${it.id}`} aria-label={`Rank ${i + 1}: ${it.name}, ${it.reason}`}>
            <span className="tf-rank">{String(i + 1).padStart(2, "0")}</span>
            <span className="tf-name">{it.name}</span>
            <span className="tf-count">{it.count}</span>
            <span className="tf-reason">
              <span>{it.reason}</span>
              {it.confirmed > 0 ? <span className="ok-text">{it.confirmed} checked by TA</span> : null}
            </span>
            <span className="tf-bar" aria-hidden>
              <span style={{ width: `${(it.count / max) * 100}%` }} />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

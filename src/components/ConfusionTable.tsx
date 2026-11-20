const LABELS = [
  ["goal-test-on-generation", "goal"],
  ["admissible-means-consistent", "adm=cons"],
  ["any-heuristic-optimal", "any-h"],
  ["g-h-swapped", "g/h"],
  ["closed-never-reopened", "closed"],
  ["bigger-h-always-better", "bigger-h"],
  ["abstain", "abstain"],
] as const;

export function ConfusionTable({ m }: { m: Record<string, Record<string, number>> }) {
  return (
    <div className="scroll-x">
      <table className="confusion">
        <caption className="sr-only">Confusion table: rows are gold labels, columns are predicted labels</caption>
        <thead>
          <tr>
            <th className="rl" scope="col">gold ↓ / predicted →</th>
            {LABELS.map(([id, s]) => (
              <th key={id} scope="col" title={id}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LABELS.map(([g, gs]) => (
            <tr key={g}>
              <th className="rl" scope="row" title={g}>{gs}</th>
              {LABELS.map(([p]) => {
                const n = m[g]?.[p] ?? 0;
                const cls = n === 0 ? "zero" : g === p ? "diag" : "off";
                return (
                  <td key={p} className={cls}>
                    {n}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

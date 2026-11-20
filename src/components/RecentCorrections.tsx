export interface CorrectionView {
  id: string;
  at: string;
  kind: "confirm" | "move" | "reject" | "rename";
  text?: string;
  fromName?: string;
  toName?: string;
  misconceptionName?: string;
  oldName?: string;
  newName?: string;
}

function describe(c: CorrectionView): string {
  const quote = c.text ? `“${c.text.length > 70 ? `${c.text.slice(0, 70)}…` : c.text}”` : "a report";
  switch (c.kind) {
    case "confirm":
      return `Confirmed ${quote} as ${c.toName}`;
    case "move":
      return `Moved ${quote} ${c.fromName === "abstain" ? "from review" : `from ${c.fromName}`} to ${c.toName}`;
    case "reject":
      return `Sent ${quote} back to review (was ${c.fromName})`;
    case "rename":
      return `Renamed “${c.oldName}” to “${c.newName}”`;
  }
}

export function RecentCorrections({ items }: { items: CorrectionView[] }) {
  if (items.length === 0)
    return <p className="small muted panel-body">No corrections yet. Every confirm, move, reject and rename is logged here.</p>;
  return (
    <ul className="log">
      {items.map((c) => (
        <li key={c.id}>
          <span className="kind">{c.kind}</span>
          <span>{describe(c)}</span>
        </li>
      ))}
    </ul>
  );
}

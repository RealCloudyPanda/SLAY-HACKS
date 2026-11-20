export function MetricCard({ label, value, detail, muted }: { label: string; value: number | null; detail: string; muted?: boolean }) {
  return (
    <div className={`metric ${muted ? "base" : ""}`}>
      <span className="small muted">{label}</span>
      <span className="v">{value === null ? "n/a" : `${(value * 100).toFixed(1)}%`}</span>
      <span className="d">{detail}</span>
    </div>
  );
}

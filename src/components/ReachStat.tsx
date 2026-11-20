export function ReachStat({ n, label, detail, win }: { n: number; label: string; detail: string; win?: boolean }) {
  return (
    <div className={`reach ${win ? "win" : ""}`}>
      <span className="small muted">{label}</span>
      <span className="big">{n}</span>
      <span className="small">{detail}</span>
    </div>
  );
}

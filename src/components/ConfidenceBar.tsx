export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span className={`conf ${value >= 0.5 ? "conf-hi" : ""}`} title="Engine confidence: how far the top match beat the runner-up">
      <span className="conf-track" aria-hidden>
        <span className="conf-fill" style={{ width: `${pct}%`, display: "block" }} />
      </span>
      <span className="num">{value.toFixed(2)}</span>
      <span className="sr-only">confidence</span>
    </span>
  );
}

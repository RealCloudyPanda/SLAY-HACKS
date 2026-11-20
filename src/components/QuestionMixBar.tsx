const TONES = ["#5a554c", "#8a8375", "#b9ad97", "#d6ccba", "#e9e2d4", "#f1ece1"];

export function QuestionMixBar({ mix, highlight }: { mix: { label: string; name: string; count: number }[]; highlight?: string }) {
  let tone = 0;
  const colored = mix.map((m) => {
    if (m.label === highlight) return { ...m, bg: "var(--pencil)", fg: "#fff" };
    if (m.label === "abstain") return { ...m, bg: "repeating-linear-gradient(45deg, var(--paper-2) 0 4px, var(--paper-3) 4px 8px)", fg: "var(--ink-2)" };
    const bg = TONES[Math.min(tone++, TONES.length - 1)];
    return { ...m, bg, fg: tone <= 2 ? "#fff" : "var(--ink)" };
  });
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="mix" aria-hidden>
        {colored.map((m) => (
          <span key={m.label} style={{ flexGrow: m.count, background: m.bg, color: m.fg }}>
            {m.count}
          </span>
        ))}
      </div>
      <ul className="mix-legend">
        {colored.map((m) => (
          <li key={m.label}>
            <i style={{ background: m.bg, border: "1px solid var(--rule)" }} />
            <span>{m.name}</span>
            <span className="num">{m.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";

const CELLS = ["--heat-2", "--heat-4", "--heat-1", "--heat-5", "--heat-3", "--heat-2", "--heat-1", "--heat-3", "--heat-1"];

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="wordmark">
      <span className="wordmark-mark" aria-hidden>
        {CELLS.map((c, i) => (
          <span key={i} style={{ background: `var(${c})` }} />
        ))}
      </span>
      Office Hours Heatmap
    </Link>
  );
}

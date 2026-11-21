export interface Clause {
  text: string;
  start: number;
  end: number;
}

const SPLIT = /[.;,!?]+|\b(?:but|because|so|and then|since)\b/gi;


export function splitClauses(original: string): Clause[] {
  const out: Clause[] = [];
  let last = 0;
  const push = (from: number, to: number) => {
    const piece = original.slice(from, to);
    const lead = piece.length - piece.trimStart().length;
    const t = piece.trim();
    if (t) out.push({ text: t, start: from + lead, end: from + lead + t.length });
  };
  for (const m of original.matchAll(SPLIT)) {
    push(last, m.index!);
    last = m.index! + m[0].length;
  }
  push(last, original.length);
  return out.length ? out : [{ text: original.trim(), start: 0, end: original.trim().length }];
}

import { tokens } from "./normalize";

export type Vec = Map<string, number>;

export function terms(text: string): string[] {
  const t = tokens(text);
  const out = [...t];
  for (let i = 0; i + 1 < t.length; i++) out.push(`${t[i]}_${t[i + 1]}`);
  return out;
}

function tf(ts: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of ts) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

export class TfIdf {
  private idf = new Map<string, number>();
  private docVecs: Vec[];

  constructor(docs: string[]) {
    const termSets = docs.map((d) => new Set(terms(d)));
    const n = docs.length;
    for (const set of termSets) for (const t of set) this.idf.set(t, (this.idf.get(t) ?? 0) + 1);
    for (const [t, df] of this.idf) this.idf.set(t, Math.log((1 + n) / (1 + df)) + 1);
    this.docVecs = docs.map((d) => this.vector(d));
  }

  vector(text: string): Vec {
    const v: Vec = new Map();
    for (const [t, c] of tf(terms(text))) {
      const w = this.idf.get(t);
      if (w) v.set(t, (1 + Math.log(c)) * w);
    }
    return v;
  }

  /** Cosine similarity of `text` to each document, in document order. */
  similarities(text: string): number[] {
    const q = this.vector(text);
    return this.docVecs.map((d) => cosine(q, d));
  }
}

export function cosine(a: Vec, b: Vec): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [, v] of a) na += v * v;
  for (const [, v] of b) nb += v * v;
  for (const [k, v] of a) dot += v * (b.get(k) ?? 0);
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

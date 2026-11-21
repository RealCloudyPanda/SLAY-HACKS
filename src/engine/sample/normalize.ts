
const SYNONYMS: [RegExp, string][] = [
  [/\bg\s*\(\s*n\s*\)|\bg of n\b|\bpath cost\b|\bcost[\s-]so[\s-]far\b|\bdistance already travell?ed\b|\bactual path cost\b/g, " gcost "],
  [/\bh\s*\(\s*n\s*\)|\bh of n\b|\bheuristic values?\b|\bestimates?\b/g, " hcost "],
  [/\bf\s*\(\s*n\s*\)|\bf values?\b|\bf column\b/g, " fcost "],
  [/\bclosed (?:set|list)\b|\bexplored set\b|\bvisited set\b|\balready explored\b/g, " closedset "],
  [/\bopen (?:list|set)\b|\bfrontier\b|\bfringe\b|\bpriority queue\b|\bpq\b|\bqueue\b/g, " openlist "],
];

export const STOPWORDS = new Set(
  "a an the i i'm im my me we you it its it's is are was were be been am to of in on at for and or but so as that this these those with by from into then than just what which who how do does did doesnt don't dont not no yes there their they them he she his her our up out if about also all any can could would should will very really".split(
    " ",
  ),
);


export function normalize(text: string): string {
  let s = ` ${text.toLowerCase()} `;
  s = s.replace(/[’‘]/g, "'");
  for (const [re, tok] of SYNONYMS) s = s.replace(re, tok);
  return s.replace(/[^a-z0-9'=+\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter((t) => t && !STOPWORDS.has(t));
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

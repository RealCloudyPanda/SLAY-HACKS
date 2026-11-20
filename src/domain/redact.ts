/** Remove obvious identifiers before a report is stored (SPEC F1). */
export function redact(text: string): string {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\d(?:[\s-]?\d){6,}/g, "[number]")
    .replace(/\b([Mm]y name is|[Mm]y name's|I am called|I'm called)\s+[A-Za-z][a-z]+(?:\s+[A-Z][a-z]+)?/g, (_m, lead: string) => `${lead} [name]`)
    .trim();
}

/** Remove obvious identifiers before a report is stored (SPEC F1). */
export function redact(text: string): string {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\d(?:[\s-]?\d){6,}/g, "[number]")
    .replace(
      /\b([Mm]y name is|[Mm]y name['’]s|[Ii] am called|[Ii]['’]m called|MY NAME IS|MY NAME['’]S|I AM CALLED|I['’]M CALLED)[ \t]+\p{L}[\p{L}\p{M}'’-]*(?:[ \t]+\p{Lu}[\p{L}\p{M}'’-]*)*/gu,
      (_match, lead: string) => `${lead} [name]`,
    )
    .trim();
}

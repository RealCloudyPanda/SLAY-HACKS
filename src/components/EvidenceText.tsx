
export function EvidenceText({ text, excerpt }: { text: string; excerpt: string }) {
  const i = excerpt ? text.indexOf(excerpt) : -1;
  if (i < 0) return <p className="report-text">{text}</p>;
  return (
    <p className="report-text">
      {text.slice(0, i)}
      <mark title="Evidence the engine quoted">{excerpt}</mark>
      {text.slice(i + excerpt.length)}
    </p>
  );
}

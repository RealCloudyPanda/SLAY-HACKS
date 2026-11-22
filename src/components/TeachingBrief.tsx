"use client";
import { useState } from 'react';
import { briefMarkdown } from '@/domain/brief';
import type { MisconceptionId } from '@/domain/types';
type Concept = ReturnType<ReturnType<typeof import('@/domain/teachingSnapshot').teachingSnapshot>['brief']>['concepts'][number];
export function TeachingBrief({ options, reviewCount, reportCount }: { options: Concept[]; reviewCount: number; reportCount: number }) {
  const [selected, setSelected] = useState<MisconceptionId[]>([]);
  const chosen = options.filter((item) => selected.includes(item.id));
  function download(markdown = false) {
    const data = { generatedAt: new Date().toISOString(), scope: 'Authored A* demo; report counts are not unique students', reviewCount, reportCount, concepts: chosen };
    const url = URL.createObjectURL(new Blob([markdown ? briefMarkdown(chosen, reviewCount, reportCount) : JSON.stringify(data, null, 2)], { type: markdown ? 'text/markdown' : 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = markdown ? 'teaching-brief.md' : 'teaching-brief.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="panel panel-body stack" aria-labelledby="brief-heading">
    <h2 id="brief-heading">Prepare the next ten minutes</h2>
    <p className="muted">Select one or two concepts. Export their existing teaching hints and current report evidence. {reviewCount} reports still need review.</p>
    {options.map((item) => <label key={item.id} className="spread">
      <span><input type="checkbox" checked={selected.includes(item.id)} disabled={!selected.includes(item.id) && chosen.length >= 2} onChange={(event) => setSelected(event.target.checked ? [...chosen.map((x) => x.id), item.id] : selected.filter((id) => id !== item.id))} /> {item.name}</span>
      <span className="small">{item.count} reports · {item.confirmed} TA checked · {item.provisional} provisional</span>
    </label>)}
    {chosen.map((item) => <div key={item.id}><h3>{item.name}</h3><p>{item.teachingHint}</p><p className="small muted">Evidence and counts reflect current corrections. Human review remains necessary.</p><ul>{item.evidence.slice(0, 3).map((e) => <li key={e.id}><q>{e.excerpt || e.text}</q> <span className="small muted">{e.questionId} · {e.status}{e.excerpt ? "" : " · full report, no retained excerpt"}</span></li>)}</ul></div>)}
    <button className="btn" disabled={chosen.length === 0} onClick={() => download(true)}>Download Markdown brief</button>
    <button className="btn" disabled={chosen.length === 0} onClick={() => download()}>Export teaching brief ({chosen.length}/2)</button>
  </section>;
}

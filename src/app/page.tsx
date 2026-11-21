import Link from "next/link";
import { EngineBadge } from "@/components/EngineBadge";
import { Wordmark } from "@/components/Wordmark";

const SHEET = [
  { q: "Q4", t: "I stopped as soon as the goal was added to the open list", m: "A* stops when the goal is generated" },
  { q: "Q2", t: "my trace stops when G gets pushed with f=9", m: "A* stops when the goal is generated" },
  { q: "Q5", t: "I returned as soon as the goal was pushed onto the queue", m: "A* stops when the goal is generated" },
];

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-top">
        <Wordmark />
        <div className="row">
          <span className="tag tag-synthetic">Synthetic demo data</span>
          <EngineBadge />
        </div>
      </div>

      <section className="hero">
        <div>
          <h1>
            Explain the <em>right thing</em> first.
          </h1>
          <p className="lede">
            Students say where they got stuck in one sentence. Before office hours, the TA sees which misconception to
            explain first, not which question number got the most complaints.
          </p>
          <div className="doors">
            <Link className="btn btn-primary" href="/ta">
              I&apos;m a TA
            </Link>
            <Link className="btn" href="/submit">
              I&apos;m a student
            </Link>
          </div>
        </div>
        <div className="sheet" aria-label="Example: three reports from different questions share one misconception">
          {SHEET.map((s) => (
            <div className="sheet-line" key={s.t}>
              <div className="row small">
                <span className="qtag">{s.q}</span>
                <span className="muted">&ldquo;{s.t}&rdquo;</span>
              </div>
            </div>
          ))}
          <p className="small" style={{ marginTop: 12 }}>
            Three questions, <b style={{ color: "var(--pencil)" }}>one explanation</b>: &ldquo;{SHEET[0].m}&rdquo;.
          </p>
        </div>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="sr-only">
          How it works
        </h2>
        <ol className="steps">
          <li>
            <span className="step-n">Students</span>
            <h3>One sentence, no name</h3>
            <p className="muted small">Pick the question, say where you got stuck. Students never see a label back.</p>
          </li>
          <li>
            <span className="step-n">Engine</span>
            <h3>Grouped by misconception</h3>
            <p className="muted small">Each report is matched to the TA&apos;s list of misconceptions, quoting its evidence word for word, or held back for review.</p>
          </li>
          <li>
            <span className="step-n">TA</span>
            <h3>Teach-first list</h3>
            <p className="muted small">Ranked by how many reports support one explanation. Confirm, move or rename anything.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}

import { SubmitForm } from "@/components/SubmitForm";
import { Wordmark } from "@/components/Wordmark";
import { UNIT_NAME } from "@/domain/questions";

export const metadata = { title: "Where did you get stuck? · Office Hours Heatmap" };

export default function SubmitPage() {
  return (
    <main className="submit-wrap">
      <div className="spread">
        <Wordmark />
        <span className="tag tag-synthetic">Synthetic demo</span>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <p className="small muted">{UNIT_NAME} · office hours Thursday</p>
        <h1 style={{ fontSize: 28 }}>Where did you get stuck?</h1>
        <p className="muted">Tell your TA in one sentence. It helps them pick what to explain first.</p>
      </div>
      <SubmitForm />
      <p className="small muted rule-top" style={{ paddingTop: 16 }}>
        Privacy: no account, no name. Emails, long numbers and &ldquo;my name is…&rdquo; are removed before your sentence is
        stored. Only the TA sees reports.
      </p>
    </main>
  );
}

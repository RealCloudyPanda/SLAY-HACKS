"use client";

import { useMutation } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { QUESTIONS } from "@/domain/questions";
import type { QuestionId } from "@/domain/types";
import { useInvalidateAll } from "@/lib/useInvalidate";
import { useTRPC } from "@/trpc/client";

const MIN = 10;
const MAX = 280;

export function SubmitForm() {
  const trpc = useTRPC();
  const invalidate = useInvalidateAll();
  const [questionId, setQuestionId] = useState<QuestionId | null>(null);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const textId = useId();
  const hintId = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const submit = useMutation(trpc.report.submit.mutationOptions({
    onSuccess: () => {
      void invalidate();
      setDone(true);
    },
  }));

  const len = text.trim().length;
  const valid = !!questionId && len >= MIN && len <= MAX;
  const prompt = QUESTIONS.find((q) => q.id === questionId)?.prompt;

  if (done) {
    return (
      <div className="success" role="status">
        <h2>Thanks. Your TA will see it before office hours.</h2>
        <p className="small muted">
          Your sentence was stored without your name. You won&apos;t see how it was grouped; that&apos;s for the TA to decide
          what to explain.
        </p>
        <div>
          <button
            className="btn"
            onClick={() => {
              setDone(false);
              setText("");
              setQuestionId(null);
              submit.reset();
            }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && questionId && !submit.isPending) submit.mutate({ questionId, text });
      }}
    >
      <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
        <legend style={{ fontWeight: 500, marginBottom: 8 }}>Which homework question?</legend>
        <div className="qpick">
          {QUESTIONS.map((q) => (
            <label key={q.id}>
              <input
                type="radio"
                name="question"
                value={q.id}
                checked={questionId === q.id}
                onChange={() => {
                  setQuestionId(q.id);
                  ref.current?.focus();
                }}
              />
              {q.short}
            </label>
          ))}
        </div>
        <p className="qprompt" aria-live="polite">
          {prompt ?? "Pick the question you were on. “Not sure” is fine."}
        </p>
      </fieldset>

      <div className="field">
        <div className="spread">
          <label htmlFor={textId}>Where did you get stuck?</label>
          <span className={`counter ${len > MAX ? "over" : ""}`} aria-live="polite">
            {len}/{MAX}
          </span>
        </div>
        <textarea
          id={textId}
          ref={ref}
          className="textarea"
          value={text}
          maxLength={MAX + 40}
          aria-describedby={hintId}
          placeholder="e.g. I stopped as soon as the goal was added to the open list"
          onChange={(e) => setText(e.target.value)}
        />
        <p id={hintId} className="hint">
          One sentence is enough. Don&apos;t include your name.
        </p>
      </div>

      {submit.error ? <p className="error-text">Couldn&apos;t send that: {submit.error.message}. Try again.</p> : null}

      <div>
        <button className="btn btn-primary" type="submit" disabled={!valid || submit.isPending} style={{ minHeight: 44, minWidth: 140 }}>
          {submit.isPending ? "Sending…" : "Submit"}
        </button>
        {!valid ? (
          <p className="hint" style={{ marginTop: 8 }}>
            {!questionId ? "Pick a question" : len < MIN ? `Write at least ${MIN} characters` : `Keep it under ${MAX} characters`}
          </p>
        ) : null}
      </div>
    </form>
  );
}

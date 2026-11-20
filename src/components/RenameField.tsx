"use client";

import { useState } from "react";

export function RenameField({ name, defaultName, onSave, saving }: { name: string; defaultName: string; onSave: (n: string) => void; saving?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  if (!editing)
    return (
      <div className="rename">
        <h1>
          <button className="rename-btn" onClick={() => { setValue(name); setEditing(true); }} title="Rename this misconception">
            {name}
          </button>
        </h1>
        <button className="btn btn-quiet btn-sm" onClick={() => { setValue(name); setEditing(true); }}>
          Rename
        </button>
        {name !== defaultName ? <span className="small muted">originally &ldquo;{defaultName}&rdquo;</span> : null}
      </div>
    );
  const trimmed = value.trim();
  return (
    <form
      className="rename"
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed && trimmed.length <= 60 && trimmed !== name) onSave(trimmed);
        setEditing(false);
      }}
    >
      <label className="sr-only" htmlFor="rename-input">Misconception name</label>
      <input
        id="rename-input"
        className="input"
        autoFocus
        value={value}
        maxLength={60}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
      />
      <button className="btn btn-primary btn-sm" type="submit" disabled={!trimmed || saving}>Save</button>
      <button className="btn btn-quiet btn-sm" type="button" onClick={() => setEditing(false)}>Cancel</button>
    </form>
  );
}

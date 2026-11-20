"use client";

import { useEffect, useRef, useState } from "react";
import type { MisconceptionId } from "@/domain/types";

export function MoveMenu({
  options,
  exclude,
  onPick,
  label = "Move to…",
  disabled,
}: {
  options: { id: MisconceptionId; name: string }[];
  exclude?: string;
  onPick: (id: MisconceptionId) => void;
  label?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLButtonElement>(".menu-item")?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="menu" ref={ref}>
      <button className="btn btn-sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} disabled={disabled}>
        {label}
      </button>
      {open ? (
        <div className="menu-pop" role="menu">
          {options
            .filter((o) => o.id !== exclude)
            .map((o) => (
              <button
                key={o.id}
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onPick(o.id);
                }}
              >
                {o.name}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UNIT_NAME } from "@/domain/questions";
import { useTRPC } from "@/trpc/client";
import { EngineBadge } from "./EngineBadge";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/ta", label: "Dashboard" },
  { href: "/ta/review", label: "Review" },
  { href: "/ta/compare", label: "Compare" },
  { href: "/ta/eval", label: "Eval" },
  { href: "/ta/settings", label: "Settings" },
];

export function TaHeader() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const pathname = usePathname();
  const summary = useQuery(trpc.dashboard.summary.queryOptions());
  const review = summary.data?.totals.review ?? 0;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reset = useMutation(
    trpc.admin.reset.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        void qc.invalidateQueries();
      },
    }),
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/ta" ? pathname === "/ta" || pathname.startsWith("/ta/m/") : pathname.startsWith(href));

  return (
    <header className="ta-header">
      <div className="ta-header-inner">
        <div className="ta-brand">
          <Wordmark />
          <span className="unit">{UNIT_NAME}</span>
          <span className="spacer" />
          <span className="tag tag-synthetic">Synthetic demo data</span>
          <EngineBadge serverEngine={summary.data?.engine} />
          <div className="menu" ref={menuRef}>
            <button className="btn btn-quiet btn-sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              Demo
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4.5 6 7.5 9 4.5" /></svg>
            </button>
            {open ? (
              <div className="menu-pop" role="menu">
                <button className="menu-item" role="menuitem" onClick={() => reset.mutate()} disabled={reset.isPending}>
                  Reset demo data
                  <small>Reseed 60 reports, clear corrections</small>
                </button>
                <Link className="menu-item" role="menuitem" href="/submit" onClick={() => setOpen(false)}>
                  Open student form
                  <small>What students see at /submit</small>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
        <nav className="ta-nav" aria-label="TA sections">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}>
              {n.label}
              {n.href === "/ta/review" ? (
                <span className={`chip ${review === 0 ? "chip-zero" : ""}`} aria-label={`${review} waiting`}>
                  {review}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

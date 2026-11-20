export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children ? <div className="muted">{children}</div> : null}
    </div>
  );
}

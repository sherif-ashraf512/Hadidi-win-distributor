export function Card({ children, className = "", padding = true }) {
  return (
    <div className={`rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.04] ${padding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 text-start">
        {title ? <h2 className="text-lg font-bold text-hadidi-primary">{title}</h2> : null}
        {subtitle ? <p className="mt-1 text-sm text-hadidi-subtle">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

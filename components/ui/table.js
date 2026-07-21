export function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/[0.08] bg-white shadow-sm ring-1 ring-black/[0.03]">
      <table className={`w-full min-w-[20rem] border-collapse text-start text-sm text-hadidi-primary ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead
      className={`border-b border-black/[0.06] bg-hadidi-muted/45 text-xs font-semibold uppercase tracking-wide text-hadidi-subtle ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return <tbody className={`divide-y divide-black/[0.06] ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr className={`transition-colors hover:bg-hadidi-muted/35 ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", align = "start", scope = "col", ...props }) {
  const alignClass = align === "end" ? "text-end" : "text-start";
  return (
    <th scope={scope} className={`whitespace-nowrap px-4 py-3 font-semibold text-hadidi-primary ${alignClass} ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td className={`px-4 py-3 align-middle text-hadidi-primary ${className}`} {...props}>
      {children}
    </td>
  );
}

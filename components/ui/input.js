export function Input({ className = "", label, id, ...props }) {
  const inputId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-hadidi-primary">
      {label ? <span>{label}</span> : null}
      <input
        id={inputId}
        className={`w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-2.5 text-start text-hadidi-primary shadow-sm outline-none transition placeholder:text-hadidi-subtle focus:border-hadidi-accent focus:ring-2 focus:ring-hadidi-accent/25 ${className}`}
        {...props}
      />
    </label>
  );
}

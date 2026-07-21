export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  disabled,
  ...props
}) {
  const variants = {
    primary:
      "bg-hadidi-accent text-hadidi-primary font-semibold shadow-sm hover:opacity-95 active:opacity-90 disabled:opacity-50",
    secondary:
      "border border-white/20 bg-white/10 text-white hover:bg-white/15 disabled:opacity-50",
    ghost: "bg-transparent text-hadidi-primary hover:bg-hadidi-muted/80",
    outline: "border border-hadidi-primary/15 bg-white text-hadidi-primary hover:bg-hadidi-muted/50",
    danger: "bg-red-500 text-white font-semibold shadow-sm hover:bg-red-600 active:bg-red-700 disabled:opacity-50",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm transition ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

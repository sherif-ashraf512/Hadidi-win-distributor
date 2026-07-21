"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export function PasswordInput({ label, className = "", id: idProp, type: _t, ...props }) {
  const { t } = useLocale();
  const uid = useId();
  const inputId = idProp || (label ? `${uid}-password` : uid);
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-hadidi-primary">
      {label ? <span>{label}</span> : null}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete ?? "current-password"}
          className={`w-full rounded-2xl border border-black/[0.08] bg-white py-2.5 ps-4 pe-12 text-start text-hadidi-primary shadow-sm outline-none transition placeholder:text-hadidi-subtle focus:border-hadidi-accent focus:ring-2 focus:ring-hadidi-accent/25 ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute end-3 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-hadidi-subtle transition hover:bg-hadidi-muted/80 hover:text-hadidi-primary"
          aria-label={visible ? t("login.hidePassword") : t("login.showPassword")}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      </div>
    </label>
  );
}

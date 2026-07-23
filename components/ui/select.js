"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/hooks/use-locale";

function normalizeSearch(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

/**
 * Ported verbatim from Hadidi-win-front's components/ui/select.js — same
 * Radix-based searchable dropdown, so both apps look and behave identically.
 */
export function Select({
  label,
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  searchable = true,
  className = "",
}) {
  const { locale, t } = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!open || !searchable) return;
    const id = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, searchable]);

  const filteredOptions = useMemo(() => {
    const q = normalizeSearch(search);
    const base = !q
      ? options
      : options.filter((opt) => {
          const labelN = normalizeSearch(opt.label);
          const valueN = normalizeSearch(opt.value);
          return labelN.includes(q) || valueN.includes(q);
        });
    const selected = options.find((o) => String(o.value) === String(value));
    if (selected && !base.some((o) => String(o.value) === String(value))) {
      return [selected, ...base];
    }
    return base;
  }, [options, search, value]);

  return (
    <div dir={dir} className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-hadidi-primary">
          {label}
        </label>
      ) : null}
      <SelectPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch("");
        }}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={id}
          dir={dir}
          aria-label={!label ? placeholder : undefined}
          className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-black/[0.1] bg-white px-4 py-2.5 text-sm text-hadidi-primary shadow-sm outline-none transition hover:border-black/[0.14] focus-visible:border-hadidi-accent focus-visible:ring-2 focus-visible:ring-hadidi-accent/20 data-[placeholder]:text-hadidi-subtle disabled:cursor-not-allowed disabled:opacity-60 data-[state=open]:border-black/[0.16]"
        >
          <span className="min-w-0 flex-1 truncate text-start">
            {value && options && options.some((o) => String(o.value) === String(value)) ? (
              <span className="text-hadidi-primary">
                {options.find((o) => String(o.value) === String(value))?.label}
              </span>
            ) : (
              <span className="text-hadidi-subtle">{placeholder}</span>
            )}
          </span>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-hadidi-subtle" aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            dir={dir}
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className="z-[110] flex max-h-[min(320px,var(--radix-select-content-available-height))] flex-col overflow-hidden rounded-2xl border border-black/[0.1] bg-white p-1 shadow-xl ring-1 ring-black/[0.04]"
            style={{ minWidth: "var(--radix-select-trigger-width)" }}
          >
            {searchable ? (
              <div
                className="shrink-0 border-b border-black/[0.06] p-2"
                onPointerDown={(e) => {
                  if (e.target.closest?.("input")) {
                    return;
                  }
                  e.preventDefault();
                }}
              >
                <input
                  ref={searchInputRef}
                  type="search"
                  dir={dir}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
                    if (!isModifierKey && e.key.length === 1) {
                      e.stopPropagation();
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-black/[0.1] bg-hadidi-muted/35 px-3 py-2 text-start text-sm text-hadidi-primary outline-none transition placeholder:text-hadidi-subtle focus:border-hadidi-accent focus:bg-white focus:ring-2 focus:ring-hadidi-accent/15"
                  placeholder={t("common.selectSearchPlaceholder")}
                  aria-label={t("common.selectSearchPlaceholder")}
                />
              </div>
            ) : null}

            <SelectPrimitive.Viewport className="max-h-[220px] min-h-0 overflow-y-auto overscroll-contain p-1.5">
              {filteredOptions.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-hadidi-subtle">{t("common.selectNoResults")}</p>
              ) : (
                filteredOptions.map((opt) => (
                  <SelectPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="relative cursor-pointer select-none rounded-xl px-3 py-2.5 text-start text-sm text-hadidi-primary outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-hadidi-muted/80 data-[state=checked]:bg-hadidi-accent/12 data-[state=checked]:font-semibold"
                  >
                    <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))
              )}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

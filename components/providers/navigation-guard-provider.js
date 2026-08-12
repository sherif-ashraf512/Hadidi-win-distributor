"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useLocale } from "@/hooks/use-locale";

const NavigationGuardContext = createContext(null);

/**
 * Register a form's "has unsaved changes" state with the app-wide navigation
 * guard. While `isDirty` is true, in-app link clicks are intercepted with a
 * confirm modal (see NavigationGuardProvider) and closing/reloading the tab
 * triggers the browser's native "leave site?" prompt. Unmounting the
 * component (e.g. navigating away via a route the guard itself approved)
 * always clears the flag, so a stale dirty state can never leak into the
 * next page. Mirrors the staff dashboard's identically-named hook/provider.
 */
export function useUnsavedChangesGuard(isDirty) {
  const ctx = useContext(NavigationGuardContext);

  useEffect(() => {
    ctx?.setDirty(isDirty);
  }, [ctx, isDirty]);

  useEffect(() => () => ctx?.setDirty(false), [ctx]);
}

export function NavigationGuardProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const dirtyRef = useRef(false);
  const pendingHrefRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  const setDirty = useCallback((value) => {
    dirtyRef.current = value;
  }, []);

  // A route change that actually went through (confirmed, or an untracked
  // page) always clears the flag — never carry a stale "dirty" state into
  // whatever page loads next.
  useEffect(() => {
    dirtyRef.current = false;
  }, [pathname]);

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (!dirtyRef.current) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href === pathname) return;

      e.preventDefault();
      pendingHrefRef.current = href;
      setModalOpen(true);
    }

    // Capture phase — must run before Next.js <Link>'s own bubble-phase
    // click handler, which bails out once it sees defaultPrevented.
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  function confirmLeave() {
    dirtyRef.current = false;
    setModalOpen(false);
    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    if (href) router.push(href);
  }

  function stayHere() {
    setModalOpen(false);
    pendingHrefRef.current = null;
  }

  return (
    <NavigationGuardContext.Provider value={{ setDirty }}>
      {children}
      {modalOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4"
              role="presentation"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) stayHere();
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/[0.06]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <h2 className="text-center text-lg font-bold text-hadidi-primary">
                  {t("common.unsavedChangesTitle")}
                </h2>
                <p className="mt-2 text-balance text-center text-sm leading-relaxed text-hadidi-subtle">
                  {t("common.unsavedChangesDesc")}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={stayHere}
                    className="inline-flex min-w-[6.5rem] cursor-pointer items-center justify-center rounded-full border border-black/[0.12] bg-white px-5 py-2.5 text-sm font-semibold text-hadidi-primary shadow-sm transition hover:bg-hadidi-muted/70"
                  >
                    {t("common.unsavedChangesStay")}
                  </button>
                  <button
                    type="button"
                    onClick={confirmLeave}
                    className="inline-flex min-w-[6.5rem] cursor-pointer items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                  >
                    {t("common.unsavedChangesLeave")}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </NavigationGuardContext.Provider>
  );
}

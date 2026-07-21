"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { useLocale } from "@/hooks/use-locale";

const COLLAPSE_KEY = "hadidi_distributor_sidebar_collapsed";
const COLLAPSE_EVENT = "hadidi-distributor:sidebar-collapsed-changed";

function readCollapsedFromStorage() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeCollapsed(onStoreChange) {
  if (typeof window === "undefined") return () => {};
  const run = () => onStoreChange();
  window.addEventListener("storage", run);
  window.addEventListener(COLLAPSE_EVENT, run);
  return () => {
    window.removeEventListener("storage", run);
    window.removeEventListener(COLLAPSE_EVENT, run);
  };
}

export function DashboardShell({ children }) {
  const { t } = useLocale();
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsedFromStorage, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    try {
      const next = !readCollapsedFromStorage();
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      window.dispatchEvent(new Event(COLLAPSE_EVENT));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="relative flex h-[100dvh] min-h-0 w-full overflow-hidden bg-hadidi-muted">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] md:hidden"
          aria-label={t("sidebar.ariaClose")}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={[
          "flex min-h-0 w-full min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out",
          collapsed ? "md:ms-[4.5rem]" : "md:ms-64",
        ].join(" ")}
      >
        <TopNavbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

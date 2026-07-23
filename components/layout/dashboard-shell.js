"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { useLocale } from "@/hooks/use-locale";
import { useAuthUser } from "@/hooks/use-auth-user";
import Image from "next/image";

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
  const { data: user } = useAuthUser();
  const isInactive = user?.warehouse?.is_active === false;
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
        <main className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {isInactive ? (
            <div className="relative flex min-h-full flex-col items-center justify-center p-4 py-8 md:py-12">
              {/* Background glowing blobs */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-[100px] pointer-events-none">
                <div className="h-64 w-64 rounded-full bg-red-400"></div>
                <div className="h-64 w-64 -ms-20 rounded-full bg-orange-300"></div>
              </div>

              <div className="relative z-10 flex w-full max-w-xl shrink-0 flex-col items-center rounded-[2.5rem] bg-white p-8 sm:p-12 md:p-14 text-center shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] ring-1 ring-black/[0.03]">
                {/* Subtle top gradient line */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 opacity-90"></div>
                
                {/* Image Container */}
                <div className="relative mb-8 aspect-square w-56 md:w-72 transition-transform hover:scale-110 hover:-rotate-2 duration-700 ease-out">
                  <Image 
                    src="/inactive-warehouse.png" 
                    alt={t("portal.inactiveTitle")} 
                    fill 
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Text content */}
                <div className="flex flex-col items-center max-w-md">
                  <div className="mb-5 inline-flex items-center justify-center rounded-full bg-red-50 px-3.5 py-1.5 text-sm font-bold text-red-600 shadow-sm border border-red-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="ms-2.5 tracking-wide">{t("portal.inactive")}</span>
                  </div>
                  
                  <h2 className="mb-3 text-3xl font-black tracking-tight text-hadidi-primary md:text-4xl">
                    {t("portal.inactiveTitle")}
                  </h2>
                  <p className="text-base font-medium leading-relaxed text-hadidi-subtle md:text-lg">
                    {t("portal.inactiveDesc")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

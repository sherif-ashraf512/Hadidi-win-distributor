"use client";

import { Menu, Warehouse } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLocale } from "@/hooks/use-locale";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { warehouseLabel } from "@/lib/format";
import { NotificationPopover } from "@/components/layout/notification-popover";

export function TopNavbar({ onOpenSidebar }) {
  const { t, locale, setLocale } = useLocale();
  const { data: user } = useAuthUser();

  usePushNotifications();

  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        <button
          type="button"
          className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-black/[0.06] bg-white text-hadidi-primary shadow-sm transition hover:bg-hadidi-muted/80 md:hidden"
          aria-label={t("portal.openMenu")}
          onClick={onOpenSidebar}
        >
          <Menu className="size-5" />
        </button>

        {user?.warehouse ? (
          <div className="flex min-w-0 items-center gap-2 rounded-full bg-hadidi-muted px-3 py-1.5 text-xs font-semibold text-hadidi-primary">
            <Warehouse className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{warehouseLabel(user.warehouse, locale)}</span>
            {user.warehouse.is_active === false ? (
              <span className="shrink-0 rounded-full bg-hadidi-subtle/20 px-2 py-0.5 text-[10px] font-bold uppercase text-hadidi-subtle">
                {t("portal.inactive")}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-1 rounded-2xl border border-black/[0.06] bg-hadidi-muted/50 p-0.5"
            role="group"
            aria-label={t("portal.toggleLanguage")}
          >
            <button
              type="button"
              onClick={() => setLocale("ar")}
              className={`cursor-pointer rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                locale === "ar" ? "bg-white text-hadidi-primary shadow-sm" : "text-hadidi-subtle hover:text-hadidi-primary"
              }`}
            >
              {t("portal.langAr")}
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`cursor-pointer rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                locale === "en" ? "bg-white text-hadidi-primary shadow-sm" : "text-hadidi-subtle hover:text-hadidi-primary"
              }`}
            >
              {t("portal.langEn")}
            </button>
          </div>
          <NotificationPopover />
        </div>
      </div>
    </header>
  );
}

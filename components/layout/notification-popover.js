"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useLocale } from "@/hooks/use-locale";

function timeAgo(dateStr, locale) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (locale === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} د`;
    if (hours < 24) return `منذ ${hours} س`;
    return `منذ ${days} ي`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationPopover() {
  const { locale, t } = useLocale();
  const { notifications, unreadCount, isLoading, hasToken, mounted, markOne, markAll, markingAll } = useNotifications();

  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!mounted || !hasToken) {
    return (
      <button
        type="button"
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-2xl border border-black/[0.06] bg-white text-hadidi-primary shadow-sm transition hover:bg-hadidi-muted/80"
        aria-label={t("notificationsPage.title")}
      >
        <Bell className="size-5" />
      </button>
    );
  }

  const hasUnread = unreadCount > 0;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-2xl border border-black/[0.06] bg-white text-hadidi-primary shadow-sm transition hover:bg-hadidi-muted/80"
        aria-label={t("notificationsPage.title")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {hasUnread ? <BellRing className="size-5 text-hadidi-accent" /> : <Bell className="size-5" />}
        {hasUnread ? (
          <span
            aria-hidden
            className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={t("notificationsPage.title")}
          dir={locale === "ar" ? "rtl" : "ltr"}
          className="absolute end-0 top-[calc(100%+8px)] z-[150] w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/[0.08] bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
            <span className="text-sm font-semibold text-hadidi-primary">
              {t("notificationsPage.title")}
              {hasUnread ? (
                <span className="ms-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  {unreadCount}
                </span>
              ) : null}
            </span>
            {hasUnread ? (
              <button
                type="button"
                onClick={() => markAll()}
                disabled={markingAll}
                title={t("notificationsPage.markAllRead")}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-hadidi-accent transition hover:bg-hadidi-muted disabled:opacity-50"
              >
                {markingAll ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
                {t("notificationsPage.markAllRead")}
              </button>
            ) : null}
          </div>

          <ul className="max-h-[24rem] divide-y divide-black/[0.04] overflow-y-auto hide-scrollbar">
            {isLoading ? (
              <li className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-hadidi-subtle" />
              </li>
            ) : notifications.length === 0 ? (
              <li className="flex flex-col items-center justify-center gap-2 py-12 text-hadidi-subtle">
                <Bell className="size-8 opacity-30" />
                <p className="text-sm">{t("notificationsPage.empty")}</p>
              </li>
            ) : (
              notifications.slice(0, 8).map((n) => {
                const isUnread = !n.read_at;
                return (
                  <li key={n.id} className={`group flex items-start gap-3 px-4 py-3 transition ${isUnread ? "bg-blue-50/60" : "hover:bg-hadidi-muted/40"}`}>
                    <div className="mt-1.5 flex shrink-0 items-center">
                      <span className={`size-2 rounded-full ${isUnread ? "bg-hadidi-accent" : "bg-transparent"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${isUnread ? "font-semibold text-hadidi-primary" : "font-medium text-hadidi-primary"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-hadidi-subtle">{n.body}</p>
                      <p className="mt-1 text-[11px] text-hadidi-subtle/70">{timeAgo(n.created_at, locale)}</p>
                    </div>
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={() => markOne(n.id)}
                        title={t("notificationsPage.markRead")}
                        className="shrink-0 cursor-pointer rounded-lg p-1 text-hadidi-subtle opacity-0 transition-opacity hover:bg-hadidi-muted hover:text-hadidi-accent group-hover:opacity-100"
                      >
                        <Check className="size-3.5" />
                      </button>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>

          {notifications.length > 0 ? (
            <div className="border-t border-black/[0.06] px-4 py-2.5 text-center">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-hadidi-accent hover:underline"
              >
                {t("notificationsPage.title")}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

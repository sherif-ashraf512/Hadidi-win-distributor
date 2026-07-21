"use client";

import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useLocale } from "@/hooks/use-locale";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export function NotificationsList() {
  const { locale, t } = useLocale();
  const { notifications, unreadCount, isLoading, isError, markOne, markAll, markingAll } = useNotifications();

  const hasUnread = unreadCount > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={t("notificationsPage.title")}
          subtitle={t("notificationsPage.subtitle")}
          action={
            hasUnread ? (
              <Button variant="outline" onClick={() => markAll()} disabled={markingAll}>
                {markingAll ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCheck className="size-4" />
                )}
                {t("notificationsPage.markAllRead")}
              </Button>
            ) : null
          }
        />
        {isLoading ? (
          <p className="text-sm text-hadidi-subtle">{t("common.loading")}</p>
        ) : isError ? (
          <p className="text-sm text-red-700">{t("common.loadError")}</p>
        ) : null}
      </Card>

      {!isLoading && !isError ? (
        <Card padding={false}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-hadidi-subtle">
              <Bell className="size-8 opacity-30" />
              <p className="text-sm">{t("notificationsPage.empty")}</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.04]">
              {notifications.map((n) => {
                const isUnread = !n.read_at;
                return (
                  <li key={n.id} className={`group flex items-start gap-3 px-4 py-3.5 transition sm:px-6 ${isUnread ? "bg-blue-50/60" : ""}`}>
                    <div className="mt-1.5 flex shrink-0 items-center">
                      <span className={`size-2 rounded-full ${isUnread ? "bg-hadidi-accent" : "bg-transparent"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${isUnread ? "font-semibold text-hadidi-primary" : "font-medium text-hadidi-primary"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-sm text-hadidi-subtle">{n.body}</p>
                      <p className="mt-1 text-xs text-hadidi-subtle/70">{timeAgo(n.created_at, locale)}</p>
                    </div>
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={() => markOne(n.id)}
                        title={t("notificationsPage.markRead")}
                        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-hadidi-subtle transition hover:bg-hadidi-muted hover:text-hadidi-accent"
                      >
                        <Check className="size-4" />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  );
}

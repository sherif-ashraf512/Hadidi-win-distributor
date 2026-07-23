"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { formatAmount, formatDateTime } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function typeLabel(t, type) {
  const key = `requestsPage.types.${type}`;
  const out = t(key);
  return out !== key ? out : type ?? "—";
}

function statusLabel(t, status) {
  const key = `requestsPage.statuses.${status}`;
  const out = t(key);
  return out !== key ? out : status ?? "—";
}

function statusBadgeClass(status) {
  if (status === "approved") return "rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-800";
  if (status === "rejected") return "rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-800";
  return "rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-800";
}

export function RequestsTable() {
  const { t, locale } = useLocale();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["distributor", "requests", page],
    queryFn: async () => {
      const { data } = await api.get("/distributor/requests", { params: { page } });
      if (data?.success === false) throw new Error(data?.message || t("common.loadError"));
      return data?.data ?? {};
    },
  });

  const payload = query.data ?? {};
  const rows = Array.isArray(payload.requests) ? payload.requests : [];
  const meta = payload.meta ?? null;
  const currentPage = Number(meta?.current_page) || page;
  const lastPage = Math.max(1, Number(meta?.last_page) || 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={t("requestsPage.title")}
          subtitle={t("requestsPage.subtitle")}
          action={
            <Link href="/requests/new">
              <Button variant="primary" className="inline-flex items-center gap-2">
                <Plus className="size-4" aria-hidden />
                {t("requestsPage.newBtn")}
              </Button>
            </Link>
          }
        />
        {query.isLoading ? (
          <p className="text-sm text-hadidi-subtle">{t("common.loading")}</p>
        ) : query.isError ? (
          <p className="text-sm text-red-700">{query.error?.message || t("common.loadError")}</p>
        ) : null}
      </Card>

      {!query.isLoading && !query.isError ? (
        <Card padding={false}>
          <div className="p-4 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-hadidi-primary">{t("requestsPage.tableTitle")}</h3>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("requestsPage.colRef")}</TableHead>
                  <TableHead>{t("requestsPage.colType")}</TableHead>
                  <TableHead>{t("requestsPage.colTotal")}</TableHead>
                  <TableHead>{t("requestsPage.colStatus")}</TableHead>
                  <TableHead>{t("requestsPage.colDate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-hadidi-subtle">
                      {t("requestsPage.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-hadidi-primary">{r.reference_no}</TableCell>
                      <TableCell className="text-hadidi-subtle">{typeLabel(t, r.type)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatAmount(r.final_total)}</TableCell>
                      <TableCell>
                        <span className={statusBadgeClass(r.status)}>{statusLabel(t, r.status)}</span>
                        {r.status === "rejected" && r.rejection_reason ? (
                          <p className="mt-1 max-w-[16rem] text-xs text-red-700">{r.rejection_reason}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-xs text-hadidi-subtle">{formatDateTime(r.created_at, locale)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {lastPage > 1 ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
                <p className="text-xs text-hadidi-subtle">{t("common.pageOf", { current: currentPage, last: lastPage })}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1 || query.isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("common.prev")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage >= lastPage || query.isFetching}
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

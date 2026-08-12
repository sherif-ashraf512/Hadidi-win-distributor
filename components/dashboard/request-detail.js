"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Printer } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { useAuthUser } from "@/hooks/use-auth-user";
import { formatAmount, formatDateTime, formatQty } from "@/lib/format";
import { itemLabelParts } from "@/lib/item-label";
import { printRequestQuote } from "@/lib/request-pdf-markup";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export function RequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { t, locale } = useLocale();
  const { data: user } = useAuthUser();

  const query = useQuery({
    queryKey: ["distributor", "requests", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/distributor/requests/${id}`);
      if (data?.success === false) throw new Error(data?.message || t("requestDetailPage.loadError"));
      return data?.data?.request ?? null;
    },
  });

  const req = query.data;
  const items = Array.isArray(req?.items) ? req.items : [];

  if (query.isLoading) {
    return (
      <Card>
        <CardHeader title={t("requestDetailPage.title")} />
        <p className="text-sm text-hadidi-subtle">{t("common.loading")}</p>
      </Card>
    );
  }

  if (query.isError || !req) {
    return (
      <Card>
        <CardHeader title={t("requestDetailPage.title")} />
        <p className="text-sm text-red-700">{query.error?.message || t("requestDetailPage.notFound")}</p>
        <div className="mt-4 flex flex-wrap gap-3 border-t border-black/[0.06] pt-4">
          <Button variant="outline" onClick={() => router.push("/requests")} className="inline-flex items-center gap-2">
            <ArrowRight className="size-4 shrink-0" aria-hidden />
            {t("requestDetailPage.backBtn")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={`${t("requestDetailPage.title")} — ${req.reference_no}`}
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => printRequestQuote({ request: req, locale, printedBy: user?.name })}
                className="inline-flex items-center gap-2"
              >
                <Printer className="size-4 shrink-0" aria-hidden />
                {t("requestDetailPage.printBtn")}
              </Button>
              <Button variant="outline" onClick={() => router.push("/requests")} className="inline-flex items-center gap-2">
                <ArrowRight className="size-4 shrink-0" aria-hidden />
                {t("requestDetailPage.backBtn")}
              </Button>
            </div>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p className="text-hadidi-subtle">{t("requestDetailPage.colType")}</p>
            <p className="mt-1 font-bold text-hadidi-primary">{typeLabel(t, req.type)}</p>
          </div>
          <div>
            <p className="text-hadidi-subtle">{t("requestDetailPage.colStatus")}</p>
            <p className="mt-1">
              <span className={statusBadgeClass(req.status)}>{statusLabel(t, req.status)}</span>
            </p>
          </div>
          <div>
            <p className="text-hadidi-subtle">{t("requestDetailPage.colDate")}</p>
            <p className="mt-1 font-bold text-hadidi-primary">{formatDateTime(req.created_at, locale)}</p>
          </div>
          <div>
            <p className="text-hadidi-subtle">{t("requestDetailPage.finalTotal")}</p>
            <p className="mt-1 text-lg font-extrabold text-hadidi-primary">{formatAmount(req.final_total, locale)}</p>
          </div>
        </div>

        {req.status === "rejected" && req.rejection_reason ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">{t("requestDetailPage.rejectionReason")}</p>
            <p className="mt-1 whitespace-pre-wrap text-red-900">{req.rejection_reason}</p>
          </div>
        ) : null}

        {req.notes ? (
          <div className="mt-4 rounded-2xl border border-black/[0.06] bg-hadidi-muted/30 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-hadidi-subtle">{t("requestDetailPage.notes")}</p>
            <p className="mt-1 whitespace-pre-wrap text-hadidi-primary">{req.notes}</p>
          </div>
        ) : null}
      </Card>

      <Card padding={false}>
        <div className="p-4 sm:p-6">
          <h3 className="mb-4 text-base font-bold text-hadidi-primary">{t("requestDetailPage.itemsTitle")}</h3>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24" />
                <TableHead>{t("requestDetailPage.colItem")}</TableHead>
                <TableHead>{t("requestDetailPage.colCategory")}</TableHead>
                <TableHead>{t("requestDetailPage.colCatalogable")}</TableHead>
                <TableHead>{t("requestDetailPage.colColor")}</TableHead>
                <TableHead>{t("requestDetailPage.colQty")}</TableHead>
                <TableHead>{t("requestDetailPage.colPrice")}</TableHead>
                <TableHead>{t("requestDetailPage.colDiscount")}</TableHead>
                <TableHead>{t("requestDetailPage.colTotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-hadidi-subtle">
                    {t("common.dash")}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => {
                  const parts = itemLabelParts(row.inventory_item, t);
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="p-1">
                        {row.inventory_item?.image_url ? (
                          <img src={row.inventory_item.image_url} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-black/[0.08] object-cover" />
                        ) : (
                          <div className="h-14 w-14 shrink-0 rounded-xl border border-dashed border-black/[0.1] bg-hadidi-muted/30" />
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-hadidi-primary">{parts.name}</TableCell>
                      <TableCell className="text-hadidi-subtle">{parts.category}</TableCell>
                      <TableCell className="text-hadidi-subtle">{parts.catalogable}</TableCell>
                      <TableCell className="text-hadidi-subtle">{parts.color}</TableCell>
                      <TableCell className="font-mono text-xs">{formatQty(row.quantity)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatAmount(row.unit_price, locale)}</TableCell>
                      <TableCell className="font-mono text-xs">{row.discount_percent ? `${formatQty(row.discount_percent)}%` : t("common.dash")}</TableCell>
                      <TableCell className="font-mono text-xs font-bold">{formatAmount(row.line_total, locale)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-black/[0.08] bg-hadidi-muted/20 p-4">
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-hadidi-subtle">{t("requestDetailPage.subtotal")}</span>
                <span className="font-mono font-semibold text-hadidi-primary">{formatAmount(req.total_amount, locale)}</span>
              </div>
              {Number(req.discount_percent) > 0 ? (
                <div className="flex justify-between gap-6">
                  <span className="text-hadidi-subtle">{t("requestDetailPage.discount")} ({req.discount_percent}%)</span>
                  <span className="font-mono font-semibold text-red-600">-{formatAmount(req.discount_amount, locale)}</span>
                </div>
              ) : null}
              {Number(req.tax_percent) > 0 ? (
                <div className="flex justify-between gap-6">
                  <span className="text-hadidi-subtle">{t("requestDetailPage.tax")} ({req.tax_percent}%)</span>
                  <span className="font-mono font-semibold text-hadidi-primary">+{formatAmount(req.tax_amount, locale)}</span>
                </div>
              ) : null}
              {Number(req.settlement_amount) !== 0 ? (
                <div className="flex justify-between gap-6">
                  <span className="text-hadidi-subtle">{t("requestDetailPage.settlement")}</span>
                  <span className="font-mono font-semibold text-hadidi-primary">{formatAmount(req.settlement_amount, locale)}</span>
                </div>
              ) : null}
              <div className="mt-1 flex justify-between gap-6 border-t border-black/[0.08] pt-1">
                <span className="font-bold text-hadidi-primary">{t("requestDetailPage.finalTotal")}</span>
                <span className="font-mono text-lg font-extrabold text-hadidi-primary">{formatAmount(req.final_total, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

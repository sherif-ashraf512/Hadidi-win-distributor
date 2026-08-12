"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLocale } from "@/hooks/use-locale";
import { formatQty, formatDateTime } from "@/lib/format";
import { itemLabelParts } from "@/lib/item-label";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function typeLabel(t, type) {
  const key = `movementsPage.types.${type}`;
  const out = t(key);
  return out !== key ? out : type ?? "—";
}

export function MovementsTable() {
  const { t, locale } = useLocale();
  const { data: user } = useAuthUser();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["distributor", "movements", page],
    queryFn: async () => {
      const { data } = await api.get("/distributor/movements", { params: { page } });
      if (data?.success === false) throw new Error(data?.message || t("common.loadError"));
      return data?.data ?? {};
    },
  });

  const payload = query.data ?? {};
  const rows = Array.isArray(payload.movements) ? payload.movements : [];
  const meta = payload.meta ?? null;
  const currentPage = Number(meta?.current_page) || page;
  const lastPage = Math.max(1, Number(meta?.last_page) || 1);
  const myWarehouseId = user?.warehouse?.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={t("movementsPage.title")} subtitle={t("movementsPage.subtitle")} />
        {query.isLoading ? (
          <p className="text-sm text-hadidi-subtle">{t("common.loading")}</p>
        ) : query.isError ? (
          <p className="text-sm text-red-700">{query.error?.message || t("common.loadError")}</p>
        ) : null}
      </Card>

      {!query.isLoading && !query.isError ? (
        <Card padding={false}>
          <div className="p-4 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-hadidi-primary">{t("movementsPage.tableTitle")}</h3>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24" />
                  <TableHead>{t("movementsPage.colItem")}</TableHead>
                  <TableHead>{t("movementsPage.colCategory")}</TableHead>
                  <TableHead>{t("movementsPage.colCatalogable")}</TableHead>
                  <TableHead>{t("movementsPage.colColor")}</TableHead>
                  <TableHead>{t("movementsPage.colType")}</TableHead>
                  <TableHead>{t("movementsPage.colQty")}</TableHead>
                  <TableHead>{t("movementsPage.colDirection")}</TableHead>
                  <TableHead>{t("movementsPage.colDate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-hadidi-subtle">
                      {t("movementsPage.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((mv) => {
                    const parts = itemLabelParts(mv.inventory_item, t);
                    return (
                    <TableRow key={mv.id}>
                      <TableCell className="p-1">
                        {mv.inventory_item?.image_url ? (
                          <img src={mv.inventory_item.image_url} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-black/[0.08] object-cover" />
                        ) : (
                          <div className="h-14 w-14 shrink-0 rounded-xl border border-dashed border-black/[0.1] bg-hadidi-muted/30" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-hadidi-primary">{parts.name}</TableCell>
                      <TableCell className="text-hadidi-subtle">{parts.category}</TableCell>
                      <TableCell className="text-hadidi-subtle">{parts.catalogable}</TableCell>
                      <TableCell className="text-hadidi-subtle">{parts.color}</TableCell>
                      <TableCell className="text-hadidi-subtle">{typeLabel(t, mv.type)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatQty(mv.quantity)}</TableCell>
                      <TableCell className="text-xs text-hadidi-subtle">
                        {mv.to_warehouse?.id === myWarehouseId ? t("movementsPage.directionIn") : t("movementsPage.directionOut")}
                      </TableCell>
                      <TableCell className="text-xs text-hadidi-subtle">{formatDateTime(mv.moved_at, locale)}</TableCell>
                    </TableRow>
                    );
                  })
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

"use client";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export function AppProviders({ children }) {
  return (
    <LocaleProvider>
      <QueryProvider>{children}</QueryProvider>
    </LocaleProvider>
  );
}

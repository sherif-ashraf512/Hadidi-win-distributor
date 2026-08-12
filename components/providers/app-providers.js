"use client";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { NavigationGuardProvider } from "@/components/providers/navigation-guard-provider";

export function AppProviders({ children }) {
  return (
    <LocaleProvider>
      <QueryProvider>
        <NavigationGuardProvider>{children}</NavigationGuardProvider>
      </QueryProvider>
    </LocaleProvider>
  );
}

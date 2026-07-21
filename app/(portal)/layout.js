"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function PortalLayout({ children }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}

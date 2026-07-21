"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLocale } from "@/hooks/use-locale";
import { clearToken } from "@/lib/auth";
import { deferNavigation } from "@/lib/navigation";
import { BrandLogoLoading } from "@/components/brand/brand-media";

function AuthSplash({ message, brand, logoAlt }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hadidi-muted px-6">
      <BrandLogoLoading alt={logoAlt} className="h-14 w-auto max-w-[220px] object-contain sm:h-16 sm:max-w-[260px]" priority />
      <div className="flex flex-col items-center gap-1">
        <p className="text-center text-sm font-medium text-hadidi-primary">{message}</p>
        <p className="text-center text-xs text-hadidi-subtle">{brand}</p>
      </div>
    </div>
  );
}

/**
 * Only checks that a valid distributor session exists — there's no
 * role/permission matrix here like the staff dashboard's
 * RequireDesktopRoute, since this portal has exactly one role and every
 * route inside it is the same distributor's own data.
 */
export function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { mounted, hasToken, isLoading, isError, data: user } = useAuthUser();

  useEffect(() => {
    if (!mounted) return;
    const next = encodeURIComponent(pathname || "/");
    if (!hasToken) {
      deferNavigation(() => router.replace(`/login?next=${next}`));
      return;
    }
    if (!isLoading && isError) {
      clearToken();
      deferNavigation(() => router.replace(`/login?next=${next}`));
    }
  }, [mounted, hasToken, isLoading, isError, pathname, router]);

  if (!mounted) {
    return <AuthSplash logoAlt={t("brand.logoAlt")} message={t("auth.splashLoading")} brand={t("auth.splashBrand")} />;
  }

  if (!hasToken) {
    return <AuthSplash logoAlt={t("brand.logoAlt")} message={t("auth.splashRedirectLogin")} brand={t("auth.splashBrand")} />;
  }

  const sessionOk = !isLoading && !isError && !!user;

  if (!sessionOk) {
    const msg = isError ? t("auth.splashSessionInvalid") : t("auth.splashChecking");
    return <AuthSplash logoAlt={t("brand.logoAlt")} message={msg} brand={t("auth.splashBrand")} />;
  }

  return children;
}

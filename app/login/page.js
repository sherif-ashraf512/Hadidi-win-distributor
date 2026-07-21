"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, extractAccessTokenFromAuthResponse } from "@/lib/auth";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLocale } from "@/hooks/use-locale";
import { safeInternalPath, deferNavigation } from "@/lib/navigation";
import { BrandLogoFull } from "@/components/brand/brand-media";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

function nextAfterLoginFromWindow() {
  if (typeof window === "undefined") return "/";
  return safeInternalPath(new URLSearchParams(window.location.search).get("next"));
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const { mounted, hasToken, isLoading, isError, data: user } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mounted || !hasToken) return;
    if (isLoading) return;
    if (isError) return;
    if (!user) return;
    deferNavigation(() => {
      router.replace(nextAfterLoginFromWindow());
    });
  }, [mounted, hasToken, isLoading, isError, user, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/distributor/auth/login", { email, password });
      if (data?.success === false) {
        setError(data?.message || t("login.errorGeneric"));
        return;
      }
      const token = extractAccessTokenFromAuthResponse(data);
      if (!token) {
        setError(t("login.errorNoToken"));
        return;
      }
      setToken(token);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      deferNavigation(() => {
        router.replace(nextAfterLoginFromWindow());
        router.refresh();
      });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 422 || status === 403) {
        setError(err.response?.data?.message || t("login.errorBadCredentials"));
        return;
      }
      setError(err.response?.data?.message || err.message || t("login.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-hadidi-primary via-hadidi-primary to-[#050818] px-5 py-14 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(255,159,28,0.14),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />

      <div className="relative w-full max-w-[420px] space-y-10">
        <header className="text-center">
          <BrandLogoFull
            alt={t("brand.logoAlt")}
            className="mx-auto mb-5 h-14 w-auto max-w-[220px] object-contain sm:h-16 sm:max-w-[260px]"
            priority
          />
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {t("login.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/65">{t("login.subtitle")}</p>
        </header>

        <Card className="border border-white/15 bg-white/98 p-7 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-9">
          <CardHeader title={t("login.cardTitle")} subtitle={t("login.cardSubtitle")} />
          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              label={t("login.email")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              label={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
            ) : null}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="mt-2 w-full justify-center py-3.5 text-base font-bold shadow-md"
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

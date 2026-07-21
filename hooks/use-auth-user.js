"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { fetchAuthUser } from "@/lib/me";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function useAuthUser() {
  const mounted = useIsClient();
  const hasToken = mounted && !!getToken();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchAuthUser,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, hasToken, mounted };
}

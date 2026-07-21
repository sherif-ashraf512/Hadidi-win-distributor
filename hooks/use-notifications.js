"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { initEcho } from "@/lib/echo";
import { useAuthUser } from "@/hooks/use-auth-user";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

async function fetchNotifications() {
  const { data } = await api.get("/distributor/notifications");
  return data.data; // { notifications, unread_count, meta, links }
}

async function markOneRead(id) {
  await api.post(`/distributor/notifications/${id}/read`);
}

async function markAllRead() {
  await api.post("/distributor/notifications/read-all");
}

export function useNotifications() {
  const mounted = useIsClient();
  const hasToken = mounted && !!getToken();
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();

  const query = useQuery({
    queryKey: ["distributor", "notifications"],
    queryFn: fetchNotifications,
    enabled: hasToken,
    staleTime: 30 * 1000,
    // Realtime (Echo) is the primary update path; this polling interval is
    // just the safety net for missed/dropped websocket events.
    refetchInterval: 60 * 1000,
  });

  const markOneMutation = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributor", "notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributor", "notifications"] });
    },
  });

  // Same private channel/event the staff dashboard listens on — channel
  // authorization (routes/channels.php, `client.{userId}`) only checks the
  // token's own user id, not role, so this works unchanged for distributors.
  useEffect(() => {
    if (!mounted || !hasToken || !user?.id) return;

    const echo = initEcho();
    if (!echo) return;

    const channelName = `client.${user.id}`;
    const channel = echo.private(channelName);

    channel.listen(".notification.new", () => {
      queryClient.invalidateQueries({ queryKey: ["distributor", "notifications"] });
    });

    return () => {
      echo.leave(channelName);
    };
  }, [mounted, hasToken, user?.id, queryClient]);

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unread_count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    hasToken,
    mounted,
    markOne: (id) => markOneMutation.mutate(id),
    markAll: () => markAllMutation.mutate(),
    markingAll: markAllMutation.isPending,
  };
}

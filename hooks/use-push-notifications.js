"use client";

import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { api } from "@/lib/api";
import { useAuthUser } from "@/hooks/use-auth-user";

const REGISTERED_KEY = "hadidi_distributor_push_registered_for_user";

/**
 * Registers this browser for Web Push once per logged-in distributor
 * (stored token goes to `fcm_token_web` on the backend, separate from any
 * mobile app token). Best-effort throughout: any failure (permission
 * denied, unsupported browser, missing VAPID key) just silently skips push
 * — it must never block the portal.
 */
export function usePushNotifications() {
  const { data: user, hasToken, mounted } = useAuthUser();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!mounted || !hasToken || !user?.id) return;
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return;

    const registeredFor = window.localStorage.getItem(REGISTERED_KEY);
    if (startedRef.current || registeredFor === String(user.id)) return;
    startedRef.current = true;

    (async () => {
      try {
        const permission =
          Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        if (!token) return;

        await api.post("/distributor/auth/fcm-token", { fcm_token: token });
        window.localStorage.setItem(REGISTERED_KEY, String(user.id));
      } catch {
        // best-effort — push registration must never break the portal
      }
    })();
  }, [mounted, hasToken, user?.id]);

  // Foreground messages never trigger the service worker's background
  // handler — the tab has to show the notification itself while focused.
  useEffect(() => {
    if (!mounted || !hasToken) return;

    let unsubscribe;
    let cancelled = false;

    (async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging || cancelled) return;
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title;
        const body = payload.notification?.body || payload.data?.body;
        if (!title || typeof Notification === "undefined" || Notification.permission !== "granted") return;
        new Notification(title, { body, icon: "/brand/logo-mark.svg" });
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [mounted, hasToken]);
}

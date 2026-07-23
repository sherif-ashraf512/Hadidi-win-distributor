// Static file served from the site root — Next.js can't inject env vars into
// it, so the config below is hardcoded. These are all public-by-design
// Firebase Web SDK values (never secrets — the secret Admin SDK credentials
// live only on the backend, never here). Same Firebase project/app as
// Hadidi-win-front, reused as-is — Web Push isn't tied to a single origin.
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD69le_KNvEMZd7KlLKCinL_Tcj2cm0VkM",
  authDomain: "hadidi-win-573bd.firebaseapp.com",
  projectId: "hadidi-win-573bd",
  storageBucket: "hadidi-win-573bd.firebasestorage.app",
  messagingSenderId: "664253106956",
  appId: "1:664253106956:web:a726d8fea33f31b20f5729",
});

const messaging = firebase.messaging();

// Fires only while no tab of this app is focused — the foreground case is
// handled separately in hooks/use-push-notifications.js via onMessage().
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "Hadidi Win";
  const body = payload.notification?.body || payload.data?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/brand/logo-mark.svg",
    data: payload.data || {},
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.click_url || "/";
  event.waitUntil(clients.openWindow(url));
});

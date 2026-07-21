/** Safe internal post-login path (prevents open redirect). Never sends back to /login. */
export function safeInternalPath(raw) {
  if (raw == null || typeof raw !== "string") return "/";
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return "/";
  if (s.startsWith("/login")) return "/";
  return s;
}

/**
 * Defers a router.push/replace call until after the App Router has finished
 * initializing in the browser, avoiding Next's "Router action dispatched
 * before initialization" error.
 * @param {() => void} fn
 */
export function deferNavigation(fn) {
  if (typeof window === "undefined") return;
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      try {
        fn();
      } catch {
        /* ignore */
      }
    });
  });
}

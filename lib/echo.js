import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getToken } from "@/lib/auth";

export const initEcho = () => {
  if (typeof window === "undefined") return null;

  window.Pusher = Pusher;

  const token = getToken();
  if (!token) return null;

  const appKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY || "fallback_key";
  const host = process.env.NEXT_PUBLIC_REVERB_HOST || "localhost";
  const port = process.env.NEXT_PUBLIC_REVERB_PORT || 8080;
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || "http";

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  // Same backend as the staff dashboard — the private `client.{id}` channel
  // authorization is role-agnostic (just checks the token's own user id), so
  // a distributor authenticates on their own channel the same way a client
  // or staff member does. See routes/channels.php in Hadidi-win-back.
  const authEndpoint = `${backendUrl}/broadcasting/auth`;

  return new Echo({
    broadcaster: "reverb",
    key: appKey,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });
};

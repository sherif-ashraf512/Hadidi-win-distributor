// Distinct key from the staff dashboard's `hadidi_auth_token` — this is a
// separate app/origin, but keeping the name distinct avoids any collision
// if the two are ever run on the same host during local development.
const TOKEN_KEY = "hadidi_distributor_auth_token";

/**
 * Supports the current Laravel shape:
 * { success, data: { access_token, token_type, user } }
 * plus a couple of simpler fallback shapes.
 */
export function extractAccessTokenFromAuthResponse(body) {
  if (!body || typeof body !== "object") return null;
  const inner = body.data;
  if (inner && typeof inner === "object" && typeof inner.access_token === "string") {
    return inner.access_token;
  }
  if (typeof body.access_token === "string") return body.access_token;
  if (inner && typeof inner === "object" && typeof inner.token === "string") return inner.token;
  if (typeof body.token === "string") return body.token;
  return null;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

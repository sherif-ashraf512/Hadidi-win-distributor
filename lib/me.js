import { api } from "@/lib/api";

/** Response shape: { success, data: { user } } */
export function parseMeResponse(body) {
  if (!body || typeof body !== "object") return null;
  if (body.success === false) return null;
  const user = body.data?.user;
  if (!user || typeof user !== "object") return null;
  return user;
}

export async function fetchAuthUser() {
  const { data } = await api.get("/distributor/auth/me");
  const user = parseMeResponse(data);
  if (!user) {
    const msg = data?.message || "Could not load profile";
    throw new Error(msg);
  }
  return user;
}

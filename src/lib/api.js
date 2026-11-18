"use client";

import { authClient } from "./auth-client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

let cachedToken = null;
let cachedExpiry = 0;
let pendingFetch = null;

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/** Returns a cached JWT, fetching a fresh one via the session cookie when needed. */
export async function getAuthToken() {
  if (cachedToken && cachedExpiry - Date.now() > 60_000) return cachedToken;
  if (pendingFetch) return pendingFetch;

  pendingFetch = (async () => {
    try {
      const res = await fetch(`${APP_URL}/api/auth/token`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        cachedToken = null;
        cachedExpiry = 0;
        return null;
      }
      const { token } = await res.json();
      cachedToken = token || null;
      cachedExpiry = token ? (decodeJwtPayload(token).exp || 0) * 1000 : 0;
      return cachedToken;
    } catch {
      return null;
    } finally {
      pendingFetch = null;
    }
  })();

  return pendingFetch;
}

export function invalidateToken() {
  cachedToken = null;
  cachedExpiry = 0;
}

/**
 * Calls the WedPlan API with the Bearer JWT attached.
 * On 401 the token is refreshed once and the request retried; if it still
 * fails the user is signed out.
 */
export async function api(path, { method = "GET", body, headers, retry = true, ...rest } = {}) {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (res.status === 401 && retry) {
    invalidateToken();
    return api(path, { method, body, headers, retry: false, ...rest });
  }

  if (res.status === 401) {
    invalidateToken();
    await authClient.signOut();
    throw new Error("Session expired. Please sign in again.");
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

api.get = (path, options) => api(path, { ...options, method: "GET" });
api.post = (path, body, options) => api(path, { ...options, method: "POST", body });
api.patch = (path, body, options) => api(path, { ...options, method: "PATCH", body });
api.delete = (path, options) => api(path, { ...options, method: "DELETE" });

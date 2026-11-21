import { getAuth } from "./auth";

/**
 * Session lookup that never throws a raw Mongo/Auth error into a Server
 * Component. Callers get `{ session, error }` and can render a graceful
 * fallback during a transient Atlas/network problem.
 */
export async function getSafeSession(requestHeaders) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: requestHeaders });
    return { session: session || null, error: null };
  } catch (err) {
    console.error(
      "[auth] session lookup failed:",
      err?.message || err?.name || "unknown error",
    );
    return { session: null, error: err };
  }
}

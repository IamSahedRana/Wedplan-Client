import { getAuth } from "@/lib/auth";

/** better-auth's fetch-style handler, called directly for GET and POST. */
async function handle(request) {
  try {
    const auth = await getAuth();
    return await auth.handler(request);
  } catch (err) {
    console.error("[auth] request failed:", err?.message || err);
    return Response.json(
      { message: "Database temporarily unavailable" },
      { status: 503 },
    );
  }
}

export const GET = handle;
export const POST = handle;

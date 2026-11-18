import { getAuth } from "@/lib/auth";

/** better-auth's fetch-style handler, called directly for GET and POST. */
async function handle(request) {
  return getAuth().handler(request);
}

export const GET = handle;
export const POST = handle;

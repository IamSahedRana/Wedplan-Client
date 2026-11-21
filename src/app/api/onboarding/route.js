import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { getMongoDb } from "@/lib/mongodb";
import { getSafeSession } from "@/lib/session";

const schema = z.object({
  role: z.enum(["customer", "vendor"]),
  businessName: z.string().max(80, "Business name is too long").optional(),
});

export async function POST(request) {
  const { session, error } = await getSafeSession(await headers());
  if (error) {
    return NextResponse.json(
      { message: "Database temporarily unavailable" },
      { status: 503 },
    );
  }
  if (!session?.user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  if (session.user.onboarded) {
    return NextResponse.json({ message: "Profile is already onboarded" }, { status: 400 });
  }

  const update = { role: parsed.data.role, onboarded: true };
  if (parsed.data.role === "vendor" && parsed.data.businessName) {
    update.businessName = parsed.data.businessName.trim();
  }

  try {
    const db = await getMongoDb();
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: update }
    );
  } catch (dbError) {
    console.error("[onboarding] update failed:", dbError?.message || dbError);
    return NextResponse.json(
      { message: "Database temporarily unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ message: "Onboarding complete", role: parsed.data.role });
}

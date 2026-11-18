import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const IMGBB_URL = "https://api.imgbb.com/1/upload";

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  if (!process.env.IMGBB_API_KEY) {
    return NextResponse.json({ message: "Image upload is not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "No image file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "Image must be 5MB or smaller" }, { status: 400 });
  }

  try {
    const uploadForm = new FormData();
    uploadForm.append("image", file);

    const res = await fetch(`${IMGBB_URL}?key=${process.env.IMGBB_API_KEY}`, {
      method: "POST",
      body: uploadForm,
    });

    if (!res.ok) {
      return NextResponse.json({ message: "Image upload failed" }, { status: 502 });
    }

    const data = await res.json();
    const url = data?.data?.url;
    if (!url) {
      return NextResponse.json({ message: "Image upload failed" }, { status: 502 });
    }

    return NextResponse.json({ url }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Image upload failed" }, { status: 502 });
  }
}

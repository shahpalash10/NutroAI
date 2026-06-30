import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/profile`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

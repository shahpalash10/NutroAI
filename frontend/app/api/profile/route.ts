import { NextResponse } from "next/server";
import { getFitnessProfile } from "@/lib/agent/orchestrator";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(getFitnessProfile());
}

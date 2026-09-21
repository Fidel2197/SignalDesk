import { NextResponse } from "next/server";
import { collectSignals } from "../../../lib/public-signals";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await collectSignals(), { headers: { "Cache-Control": "no-store" } });
}

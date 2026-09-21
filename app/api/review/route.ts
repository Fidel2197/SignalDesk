import { NextResponse } from "next/server";
import { buildReview, parseReviewRequest } from "../../../lib/incident-review";

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 32_768) return NextResponse.json({ error: "Review input is too large." }, { status: 413 });
    const body = parseReviewRequest(JSON.parse(text));
    return NextResponse.json(buildReview(body), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Provide a valid scenario severity, service, risk, and bounded evidence list." }, { status: 400 });
  }
}

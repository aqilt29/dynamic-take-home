import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}

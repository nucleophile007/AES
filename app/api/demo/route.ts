import { NextResponse } from "next/server";
import { DemoResponse } from "@/shared/api";

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const response: DemoResponse = {
    message: "Hello from Next.js API server",
  };

  return NextResponse.json(response);
}

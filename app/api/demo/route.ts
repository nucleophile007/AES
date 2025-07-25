import { NextResponse } from "next/server";
import { DemoResponse } from "@/shared/api";

export async function GET() {
  const response: DemoResponse = {
    message: "Hello from Next.js API server",
  };

  return NextResponse.json(response);
}

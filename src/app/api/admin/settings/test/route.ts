import { NextResponse } from "next/server"
import { testOpenRouterConnection } from "@/lib/openrouter"

export async function POST(req: Request) {
  const { key } = await req.json()

  if (!key) {
    return NextResponse.json({ success: false })
  }

  const success = await testOpenRouterConnection(key)
  return NextResponse.json({ success })
}

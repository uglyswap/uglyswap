import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { encrypt, decrypt } from "@/lib/encryption"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userData?.is_admin) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const { data: settings } = await adminClient
    .from("settings")
    .select("key, value, encrypted")

  const result: Record<string, string> = {}
  settings?.forEach((setting) => {
    try {
      result[setting.key] = setting.encrypted ? decrypt(setting.value) : setting.value
    } catch {
      result[setting.key] = ""
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userData?.is_admin) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 })
  }

  const body = await req.json()
  const adminClient = createAdminClient()

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && value) {
      const encryptedValue = encrypt(value)
      await adminClient.from("settings").upsert({
        key,
        value: encryptedValue,
        encrypted: true,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return NextResponse.json({ success: true })
}

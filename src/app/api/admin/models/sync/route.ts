import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { decrypt } from "@/lib/encryption"
import { getOpenRouterModels } from "@/lib/openrouter"

export async function POST() {
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

  const { data: apiKeySetting } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "openrouter_api_key")
    .single()

  if (!apiKeySetting) {
    return NextResponse.json({ error: "Cle API non configuree" }, { status: 400 })
  }

  const apiKey = decrypt(apiKeySetting.value)
  const models = await getOpenRouterModels(apiKey)

  let count = 0
  for (const model of models) {
    const provider = model.id.split("/")[0]
    await adminClient.from("ai_models").upsert({
      model_id: model.id,
      name: model.name,
      provider,
      description: model.description,
      context_length: model.context_length,
      is_active: false,
      cost_per_credit: 1,
    })
    count++
  }

  return NextResponse.json({ count })
}

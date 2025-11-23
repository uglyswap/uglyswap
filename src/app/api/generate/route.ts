import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { decrypt } from "@/lib/encryption"
import { generateWithOpenRouter } from "@/lib/openrouter"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 })
  }

  const { templateId, model, inputs } = await req.json()

  const adminClient = createAdminClient()

  // Get user data
  const { data: userData } = await adminClient
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!userData) {
    return NextResponse.json({ error: "Utilisateur non trouve" }, { status: 404 })
  }

  // Get model data
  const { data: modelData } = await adminClient
    .from("ai_models")
    .select("*")
    .eq("model_id", model)
    .eq("is_active", true)
    .single()

  if (!modelData) {
    return NextResponse.json({ error: "Modele non disponible" }, { status: 400 })
  }

  // Check credits
  if (userData.credits < modelData.cost_per_credit) {
    return NextResponse.json({ error: "Credits insuffisants" }, { status: 402 })
  }

  // Get template
  const { data: template } = await adminClient
    .from("prompt_templates")
    .select("*")
    .eq("id", templateId)
    .single()

  if (!template) {
    return NextResponse.json({ error: "Template non trouve" }, { status: 404 })
  }

  // Build prompt
  let finalPrompt = template.prompt_text
  for (const [key, value] of Object.entries(inputs)) {
    finalPrompt = finalPrompt.replace(new RegExp(`\\{${key}\\}`, "g"), value as string)
  }

  // Get API key
  const { data: apiKeySetting } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "openrouter_api_key")
    .single()

  if (!apiKeySetting) {
    return NextResponse.json({ error: "API non configuree" }, { status: 500 })
  }

  const apiKey = decrypt(apiKeySetting.value)

  try {
    // Generate
    const result = await generateWithOpenRouter(apiKey, model, finalPrompt)

    // Deduct credits
    await adminClient
      .from("users")
      .update({ credits: userData.credits - modelData.cost_per_credit })
      .eq("id", user.id)

    // Update template usage
    await adminClient
      .from("prompt_templates")
      .update({ usage_count: template.usage_count + 1 })
      .eq("id", templateId)

    // Save generation
    await adminClient.from("generations").insert({
      user_id: user.id,
      template_id: templateId,
      model_used: model,
      inputs,
      full_prompt: finalPrompt,
      result,
      credits_used: modelData.cost_per_credit,
    })

    return NextResponse.json({
      result,
      creditsRemaining: userData.credits - modelData.cost_per_credit,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur de generation" },
      { status: 500 }
    )
  }
}

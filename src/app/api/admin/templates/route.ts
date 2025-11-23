import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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
  const { data: templates } = await adminClient
    .from("prompt_templates")
    .select("*")
    .order("created_at", { ascending: false })

  return NextResponse.json(templates || [])
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
  const { fields, ...templateData } = body

  const adminClient = createAdminClient()

  const { data: template, error: templateError } = await adminClient
    .from("prompt_templates")
    .insert({
      ...templateData,
      is_active: true,
      usage_count: 0,
    })
    .select()
    .single()

  if (templateError) {
    return NextResponse.json({ error: templateError.message }, { status: 400 })
  }

  if (fields && fields.length > 0) {
    const fieldsWithTemplateId = fields.map((field: Record<string, unknown>) => ({
      ...field,
      template_id: template.id,
    }))

    await adminClient.from("template_fields").insert(fieldsWithTemplateId)
  }

  return NextResponse.json(template)
}

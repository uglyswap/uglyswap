import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { data, error } = await adminClient
    .from("prompt_templates")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
  await adminClient.from("prompt_templates").delete().eq("id", id)

  return NextResponse.json({ success: true })
}

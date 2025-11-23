import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { decrypt } from "@/lib/encryption"
import { getStripe, createCheckoutSession, createCustomer } from "@/lib/stripe"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 })
  }

  const { priceId } = await req.json()
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

  // Get Stripe key
  const { data: stripeKeySetting } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "stripe_secret_key")
    .single()

  if (!stripeKeySetting) {
    return NextResponse.json({ error: "Stripe non configure" }, { status: 500 })
  }

  const stripeKey = decrypt(stripeKeySetting.value)
  const stripe = getStripe(stripeKey)

  // Create or get customer
  let customerId = userData.stripe_customer_id
  if (!customerId) {
    const customer = await createCustomer(stripe, userData.email, userData.name || undefined)
    customerId = customer.id
    await adminClient
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id)
  }

  // Create checkout session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const session = await createCheckoutSession(
    stripe,
    priceId,
    customerId,
    `${appUrl}/dashboard?success=true`,
    `${appUrl}/pricing?canceled=true`
  )

  return NextResponse.json({ url: session.url })
}

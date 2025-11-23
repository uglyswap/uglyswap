import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { decrypt } from "@/lib/encryption"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Get Stripe keys
  const { data: stripeKeySetting } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "stripe_secret_key")
    .single()

  const { data: webhookSecretSetting } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "stripe_webhook_secret")
    .single()

  if (!stripeKeySetting || !webhookSecretSetting) {
    return NextResponse.json({ error: "Stripe non configure" }, { status: 500 })
  }

  const stripeKey = decrypt(stripeKeySetting.value)
  const webhookSecret = decrypt(webhookSecretSetting.value)
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      // Get user by customer ID
      const { data: user } = await adminClient
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (user) {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        // Get plan by price ID
        const { data: plan } = await adminClient
          .from("pricing_plans")
          .select("id, credits")
          .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
          .single()

        if (plan) {
          // Update user credits and plan
          await adminClient
            .from("users")
            .update({
              credits: plan.credits,
              plan: plan.id,
            })
            .eq("id", user.id)

          // Create subscription record
          await adminClient.from("subscriptions").insert({
            user_id: user.id,
            plan_id: plan.id,
            stripe_subscription_id: subscriptionId,
            status: "active",
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
        }
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      await adminClient
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id)
      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        // Get subscription
        const { data: sub } = await adminClient
          .from("subscriptions")
          .select("user_id, plan:pricing_plans(credits)")
          .eq("stripe_subscription_id", subscriptionId)
          .single()

        if (sub && sub.plan) {
          // Reset credits for renewal
          await adminClient
            .from("users")
            .update({ credits: (sub.plan as { credits: number }).credits })
            .eq("id", sub.user_id)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

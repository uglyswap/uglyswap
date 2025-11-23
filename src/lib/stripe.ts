import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(secretKey: string): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    })
  }
  return stripeInstance
}

export async function createCheckoutSession(
  stripe: Stripe,
  priceId: string,
  customerId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

export async function createCustomer(
  stripe: Stripe,
  email: string,
  name?: string
) {
  return stripe.customers.create({
    email,
    name,
  })
}

export async function cancelSubscription(
  stripe: Stripe,
  subscriptionId: string
) {
  return stripe.subscriptions.cancel(subscriptionId)
}

export async function getSubscription(
  stripe: Stripe,
  subscriptionId: string
) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

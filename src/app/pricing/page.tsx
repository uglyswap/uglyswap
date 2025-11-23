"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PricingPlan } from "@/types"

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from("pricing_plans")
        .select("*")
        .eq("is_active", true)
        .order("order_index")

      setPlans(data || [])
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const handleCheckout = async (plan: PricingPlan) => {
    if (!user) {
      window.location.href = "/register"
      return
    }

    if (!plan.stripe_price_id_monthly) {
      toast({
        title: "Plan non disponible",
        description: "Ce plan n'est pas encore configure",
        variant: "destructive",
      })
      return
    }

    setCheckoutLoading(plan.id)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.stripe_price_id_monthly }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Erreur")
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de creer la session de paiement",
        variant: "destructive",
      })
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Prompt SaaS</span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Commencer</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tarification simple</h1>
          <p className="text-xl text-muted-foreground">
            Choisissez le plan adapte a vos besoins
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={plan.id} className={index === 1 ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  {index === 1 && <Badge className="w-fit mb-2">Populaire</Badge>}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.credits} credits/mois
                  </CardDescription>
                  <div className="text-3xl font-bold mt-4">
                    {plan.price_monthly === 0 ? (
                      "Gratuit"
                    ) : (
                      <>
                        {(plan.price_monthly / 100).toFixed(0)}EUR
                        <span className="text-sm font-normal">/mois</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(plan.features as string[])?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.price_monthly === 0 ? (
                    <Link href="/register" className="w-full">
                      <Button variant="outline" className="w-full">
                        Commencer gratuitement
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout(plan)}
                      disabled={checkoutLoading === plan.id}
                    >
                      {checkoutLoading === plan.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Souscrire
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

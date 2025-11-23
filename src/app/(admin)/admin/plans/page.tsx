"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { PricingPlan } from "@/types"

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/plans")
    if (res.ok) {
      const data = await res.json()
      setPlans(data)
    }
    setLoading(false)
  }

  const updatePlan = async (plan: PricingPlan, updates: Partial<PricingPlan>) => {
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      setPlans(plans.map(p => p.id === plan.id ? { ...p, ...updates } : p))
      toast({ title: "Plan mis a jour" })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Plans tarifaires</h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <Switch
                    checked={plan.is_active}
                    onCheckedChange={(checked) => updatePlan(plan, { is_active: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    value={plan.credits}
                    onChange={(e) => updatePlan(plan, { credits: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix mensuel (centimes)</Label>
                  <Input
                    type="number"
                    value={plan.price_monthly}
                    onChange={(e) => updatePlan(plan, { price_monthly: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stripe Price ID (mensuel)</Label>
                  <Input
                    value={plan.stripe_price_id_monthly || ""}
                    onChange={(e) => updatePlan(plan, { stripe_price_id_monthly: e.target.value })}
                    placeholder="price_..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

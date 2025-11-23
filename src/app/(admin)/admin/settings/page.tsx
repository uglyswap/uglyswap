"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, X } from "lucide-react"

export default function AdminSettingsPage() {
  const [openrouterKey, setOpenrouterKey] = useState("")
  const [stripeSecretKey, setStripeSecretKey] = useState("")
  const [stripePublishableKey, setStripePublishableKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const res = await fetch("/api/admin/settings")
    if (res.ok) {
      const data = await res.json()
      setOpenrouterKey(data.openrouter_api_key || "")
      setStripeSecretKey(data.stripe_secret_key || "")
      setStripePublishableKey(data.stripe_publishable_key || "")
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openrouter_api_key: openrouterKey,
          stripe_secret_key: stripeSecretKey,
          stripe_publishable_key: stripePublishableKey,
        }),
      })

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde")

      toast({ title: "Parametres sauvegardes" })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setConnectionStatus(null)
    try {
      const res = await fetch("/api/admin/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: openrouterKey }),
      })
      const data = await res.json()
      setConnectionStatus(data.success)
      toast({
        title: data.success ? "Connexion reussie" : "Connexion echouee",
        variant: data.success ? "default" : "destructive",
      })
    } catch {
      setConnectionStatus(false)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Parametres API</h1>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>OpenRouter</CardTitle>
            <CardDescription>
              Cle API pour acceder aux modeles IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openrouter">Cle API OpenRouter</Label>
              <Input
                id="openrouter"
                type="password"
                placeholder="sk-or-..."
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={testConnection} disabled={testing || !openrouterKey}>
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tester la connexion
              </Button>
              {connectionStatus !== null && (
                <Badge variant={connectionStatus ? "default" : "destructive"}>
                  {connectionStatus ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  {connectionStatus ? "OK" : "Erreur"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe</CardTitle>
            <CardDescription>
              Cles API pour les paiements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe-secret">Cle secrete</Label>
              <Input
                id="stripe-secret"
                type="password"
                placeholder="sk_..."
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-pub">Cle publique</Label>
              <Input
                id="stripe-pub"
                type="text"
                placeholder="pk_..."
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={saveSettings} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}

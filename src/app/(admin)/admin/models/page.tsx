"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw } from "lucide-react"
import type { AIModel } from "@/types"

export default function AdminModelsPage() {
  const [models, setModels] = useState<AIModel[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/models")
    if (res.ok) {
      const data = await res.json()
      setModels(data)
    }
    setLoading(false)
  }

  const syncModels = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/admin/models/sync", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast({ title: `${data.count} modeles synchronises` })
      loadModels()
    } catch {
      toast({ title: "Erreur de synchronisation", variant: "destructive" })
    } finally {
      setSyncing(false)
    }
  }

  const toggleModel = async (model: AIModel) => {
    const res = await fetch(`/api/admin/models/${model.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !model.is_active }),
    })
    if (res.ok) {
      setModels(models.map(m => m.id === model.id ? { ...m, is_active: !m.is_active } : m))
    }
  }

  const updateCredits = async (model: AIModel, credits: number) => {
    const res = await fetch(`/api/admin/models/${model.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cost_per_credit: credits }),
    })
    if (res.ok) {
      setModels(models.map(m => m.id === model.id ? { ...m, cost_per_credit: credits } : m))
    }
  }

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.model_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Modeles IA</h1>
        <Button onClick={syncModels} disabled={syncing}>
          {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Synchroniser depuis OpenRouter
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Rechercher un modele..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredModels.map((model) => (
            <Card key={model.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.provider && (
                      <Badge variant="outline">{model.provider}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{model.model_id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Credits:</span>
                    <Input
                      type="number"
                      min="1"
                      value={model.cost_per_credit}
                      onChange={(e) => updateCredits(model, parseInt(e.target.value) || 1)}
                      className="w-16 h-8"
                    />
                  </div>
                  <Switch
                    checked={model.is_active}
                    onCheckedChange={() => toggleModel(model)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredModels.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun modele trouve
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

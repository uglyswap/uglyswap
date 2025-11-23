"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import type { PromptTemplate } from "@/types"

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/templates")
    if (res.ok) {
      const data = await res.json()
      setTemplates(data)
    }
    setLoading(false)
  }

  const toggleTemplate = async (template: PromptTemplate) => {
    const res = await fetch(`/api/admin/templates/${template.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !template.is_active }),
    })
    if (res.ok) {
      setTemplates(templates.map(t => t.id === template.id ? { ...t, is_active: !t.is_active } : t))
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm("Supprimer ce template ?")) return
    const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" })
    if (res.ok) {
      setTemplates(templates.filter(t => t.id !== id))
      toast({ title: "Template supprime" })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Link href="/admin/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau template
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon || "📝"}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.usage_count} utilisations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={() => toggleTemplate(template)}
                  />
                  <Link href={`/admin/templates/${template.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {templates.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun template. Creez-en un !
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

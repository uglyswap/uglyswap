"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FieldConfig {
  variable_name: string
  label: string
  type: "text" | "textarea" | "select" | "number"
  placeholder: string
  help_text: string
  required: boolean
  options: string[]
}

export default function NewTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [icon, setIcon] = useState("📝")
  const [promptText, setPromptText] = useState("")
  const [fields, setFields] = useState<FieldConfig[]>([])

  const detectVariables = (text: string) => {
    const regex = /\{([^}]+)\}/g
    const matches = text.match(regex) || []
    const variables = matches.map(m => m.slice(1, -1))
    return [...new Set(variables)]
  }

  const handlePromptChange = (text: string) => {
    setPromptText(text)
    const variables = detectVariables(text)

    const existingVars = new Set(fields.map(f => f.variable_name))
    const newFields = variables
      .filter(v => !existingVars.has(v))
      .map(v => ({
        variable_name: v,
        label: v.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        type: "text" as const,
        placeholder: "",
        help_text: "",
        required: true,
        options: [],
      }))

    if (newFields.length > 0) {
      setFields([...fields, ...newFields])
    }
  }

  const updateField = (index: number, updates: Partial<FieldConfig>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f))
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!name || !promptText) {
      toast({ title: "Veuillez remplir les champs obligatoires", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          icon,
          prompt_text: promptText,
          fields: fields.map((f, i) => ({ ...f, order_index: i })),
        }),
      })

      if (!res.ok) throw new Error()
      toast({ title: "Template cree" })
      router.push("/admin/templates")
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Nouveau Template</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Icone</Label>
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Nom *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Generateur de description" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description courte" />
              </div>
              <div className="space-y-2">
                <Label>Categorie</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Marketing" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
              <CardDescription>Utilisez {"{"}variable{"}"} pour les champs dynamiques</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={promptText}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="Ex: Cree une description pour {nom_produit}..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Champs ({fields.length})</CardTitle>
              <CardDescription>Configurez les champs du formulaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{`{${field.variable_name}}`}</code>
                    <Button variant="ghost" size="sm" onClick={() => removeField(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, { type: value as FieldConfig["type"] })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texte</SelectItem>
                          <SelectItem value="textarea">Texte long</SelectItem>
                          <SelectItem value="select">Selection</SelectItem>
                          <SelectItem value="number">Nombre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {field.type === "select" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Options (separees par virgule)</Label>
                      <Input
                        value={field.options.join(", ")}
                        onChange={(e) => updateField(index, { options: e.target.value.split(",").map(s => s.trim()) })}
                        className="h-8 text-sm"
                        placeholder="Option 1, Option 2"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={field.placeholder}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Requis</Label>
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(index, { required: checked })}
                    />
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ajoutez des variables dans le prompt pour creer des champs
                </p>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Creer le template
          </Button>
        </div>
      </div>
    </div>
  )
}

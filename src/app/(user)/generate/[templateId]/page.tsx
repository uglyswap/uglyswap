"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, Copy, Check, Coins } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { TemplateWithFields, AIModel, User } from "@/types"

export default function GeneratePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const templateId = params.templateId as string

  const [template, setTemplate] = useState<TemplateWithFields | null>(null)
  const [models, setModels] = useState<AIModel[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/login")
        return
      }

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()
      setUser(userData)

      const { data: templateData } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("id", templateId)
        .single()

      if (templateData) {
        const { data: fields } = await supabase
          .from("template_fields")
          .select("*")
          .eq("template_id", templateId)
          .order("order_index")

        setTemplate({ ...templateData, fields: fields || [] })
      }

      const { data: modelsData } = await supabase
        .from("ai_models")
        .select("*")
        .eq("is_active", true)
        .order("cost_per_credit")

      setModels(modelsData || [])
      if (modelsData && modelsData.length > 0) {
        setSelectedModel(modelsData[0].model_id)
      }
    }

    loadData()
  }, [templateId, router, supabase])

  const handleGenerate = async () => {
    if (!template || !selectedModel || !user) return

    const model = models.find(m => m.model_id === selectedModel)
    if (!model) return

    if (user.credits < model.cost_per_credit) {
      toast({
        title: "Credits insuffisants",
        description: "Veuillez acheter plus de credits pour continuer",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          model: selectedModel,
          inputs: formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la generation")
      }

      setResult(data.result)
      setUser(prev => prev ? { ...prev, credits: data.creditsRemaining } : null)

      toast({
        title: "Generation reussie",
        description: `${model.cost_per_credit} credits utilises`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const selectedModelData = models.find(m => m.model_id === selectedModel)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl">{template.icon}</span>
              <h1 className="text-xl font-bold">{template.name}</h1>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Coins className="h-3 w-3" />
            {user?.credits || 0} credits
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Parametres</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.variable_name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === "text" && (
                    <Input
                      id={field.variable_name}
                      placeholder={field.placeholder || ""}
                      value={formData[field.variable_name] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.variable_name]: e.target.value }))}
                      required={field.required}
                    />
                  )}
                  {field.type === "textarea" && (
                    <Textarea
                      id={field.variable_name}
                      placeholder={field.placeholder || ""}
                      value={formData[field.variable_name] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.variable_name]: e.target.value }))}
                      required={field.required}
                    />
                  )}
                  {field.type === "select" && field.options && (
                    <Select
                      value={formData[field.variable_name] || ""}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, [field.variable_name]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === "number" && (
                    <Input
                      id={field.variable_name}
                      type="number"
                      placeholder={field.placeholder || ""}
                      value={formData[field.variable_name] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.variable_name]: e.target.value }))}
                      required={field.required}
                    />
                  )}
                  {field.help_text && (
                    <p className="text-xs text-muted-foreground">{field.help_text}</p>
                  )}
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <Label>Modele IA</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.model_id} value={model.model_id}>
                        {model.name} ({model.cost_per_credit} credits)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full"
                disabled={loading || !selectedModel}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generation en cours...
                  </>
                ) : (
                  <>
                    Generer ({selectedModelData?.cost_per_credit || 0} credits)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resultat</CardTitle>
                {result && (
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                  {result}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Le resultat apparaitra ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

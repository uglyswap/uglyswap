import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText } from "lucide-react"

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: generations } = await supabase
    .from("generations")
    .select("*, template:prompt_templates(name, icon)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Historique des generations</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {generations && generations.length > 0 ? (
          <div className="space-y-4">
            {generations.map((gen) => (
              <Card key={gen.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{gen.template?.icon || "📝"}</span>
                      <div>
                        <CardTitle className="text-lg">{gen.template?.name || "Template supprime"}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(gen.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{gen.credits_used} credits</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {gen.result}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune generation pour le moment</p>
              <Link href="/dashboard">
                <Button variant="outline" className="mt-4">
                  Voir les templates
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

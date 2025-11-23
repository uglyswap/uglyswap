import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, FileText, History, Settings, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: templates } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("is_active", true)
    .order("usage_count", { ascending: false })

  const { data: recentGenerations } = await supabase
    .from("generations")
    .select("*, template:prompt_templates(name, icon)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3" />
              {userData?.credits || 0} credits
            </Badge>
            <Link href="/history">
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Bienvenue, {userData?.name || "Utilisateur"}
          </h2>
          <p className="text-muted-foreground">
            Choisissez un template pour generer du contenu
          </p>
        </div>

        <section className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Templates disponibles</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Link key={template.id} href={`/generate/${template.id}`}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{template.icon || "📝"}</span>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {(!templates || templates.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun template disponible pour le moment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {recentGenerations && recentGenerations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generations recentes</h3>
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentGenerations.map((gen) => (
                <Card key={gen.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span>{gen.template?.icon || "📝"}</span>
                      <div>
                        <p className="font-medium text-sm">{gen.template?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(gen.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{gen.credits_used} credits</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

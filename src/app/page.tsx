import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Sparkles, ArrowRight, Check } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Prompt SaaS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Tarifs
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Commencer</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          Nouveau - Modeles GPT-4 et Claude disponibles
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Generez du contenu IA<br />en quelques clics
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Utilisez nos templates pre-configures pour creer des descriptions produits,
          articles de blog, emails marketing et bien plus encore.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Essayer gratuitement <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              Voir les tarifs
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          10 credits offerts - Aucune carte requise
        </p>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Pourquoi choisir Prompt SaaS ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Rapide et Simple</CardTitle>
              <CardDescription>
                Remplissez un formulaire, choisissez votre modele IA, et obtenez
                votre contenu en quelques secondes.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Modeles Premium</CardTitle>
              <CardDescription>
                Acces aux meilleurs modeles IA : GPT-4, Claude, Gemini et bien
                d&apos;autres via OpenRouter.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Templates Pro</CardTitle>
              <CardDescription>
                Des templates optimises pour chaque cas d&apos;usage : marketing,
                e-commerce, SEO, et plus.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Tarification simple et transparente
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Commencez gratuitement, evoluez selon vos besoins
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Gratuit</CardTitle>
              <CardDescription>Pour decouvrir</CardDescription>
              <div className="text-3xl font-bold mt-4">0EUR</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">10 credits/mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Modeles standards</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <Badge className="w-fit mb-2">Populaire</Badge>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Pour les pros</CardDescription>
              <div className="text-3xl font-bold mt-4">19EUR<span className="text-sm font-normal">/mois</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">500 credits/mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Tous les modeles</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <CardDescription>Pour les equipes</CardDescription>
              <div className="text-3xl font-bold mt-4">49EUR<span className="text-sm font-normal">/mois</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">2000 credits/mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">API access</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Prompt SaaS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 Prompt SaaS. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

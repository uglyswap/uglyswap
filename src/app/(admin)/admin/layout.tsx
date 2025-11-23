import Link from "next/link"
import { Settings, Cpu, FileText, CreditCard, BarChart3, Home } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-background p-4">
        <div className="mb-8">
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>
        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm">
            <Settings className="h-4 w-4" />
            Parametres API
          </Link>
          <Link href="/admin/models" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm">
            <Cpu className="h-4 w-4" />
            Modeles IA
          </Link>
          <Link href="/admin/templates" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm">
            <FileText className="h-4 w-4" />
            Templates
          </Link>
          <Link href="/admin/plans" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm">
            <CreditCard className="h-4 w-4" />
            Plans
          </Link>
          <div className="pt-4 border-t mt-4">
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              Retour app
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-muted/30">{children}</main>
    </div>
  )
}

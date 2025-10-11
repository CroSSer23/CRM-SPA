import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"

export default async function CatalogPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  if (user.role !== 'ADMIN' && user.role !== 'PROCUREMENT') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Catalog</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Catalog page - Coming soon</p>
        </Card>
      </div>
    </div>
  )
}

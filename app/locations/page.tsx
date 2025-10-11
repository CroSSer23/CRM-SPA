import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"

export default async function LocationsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Locations</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Locations page - Coming soon</p>
        </Card>
      </div>
    </div>
  )
}

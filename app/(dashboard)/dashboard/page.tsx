import { requireUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name} ({user.role})</p>
          </div>
          <form action="/api/logout" method="POST">
            <Button type="submit" variant="outline">Sign Out</Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Requisitions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your purchase requisitions
              </p>
              <Link href="/requisitions">
                <Button>View Requisitions</Button>
              </Link>
            </CardContent>
          </Card>

          {(user.role === "ADMIN" || user.role === "PROCUREMENT") && (
            <Card>
              <CardHeader>
                <CardTitle>Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage products and categories
                </p>
                <Link href="/catalog">
                  <Button>View Catalog</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {user.role === "ADMIN" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage SPA locations
                  </p>
                  <Link href="/locations">
                    <Button>View Locations</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage users and roles
                  </p>
                  <Link href="/users">
                    <Button>View Users</Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
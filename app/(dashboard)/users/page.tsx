import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageUsers } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ROLE_LABELS } from "@/lib/types"

async function getUsers() {
  return await prisma.user.findMany({
    include: {
      locations: {
        include: {
          location: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })
}

export default async function UsersPage() {
  const rbac = await getRBACContext()

  if (!rbac.user || !canManageUsers(rbac.user.role)) {
    redirect("/")
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage users and permissions</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{user.name}</p>
                  <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.locations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.locations.map((loc) => (
                      <Badge key={loc.id} variant="secondary" className="text-xs">
                        {loc.location.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


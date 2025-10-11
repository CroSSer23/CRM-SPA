import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getUsers() {
  return await prisma.user.findMany({
    include: {
      locations: {
        include: {
          location: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export default async function UsersPage() {
  await requireAdmin()
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage users and roles</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.locations.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {user.locations.map((loc) => (
                        <Badge key={loc.id} variant="outline" className="text-xs">
                          {loc.location.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge>{user.role}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

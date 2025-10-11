import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageLocations } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getLocations() {
  return await prisma.location.findMany({
    include: {
      _count: {
        select: {
          users: true,
          assignments: true,
          requisitions: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })
}

export default async function LocationsPage() {
  const rbac = await getRBACContext()

  if (!canManageLocations(rbac)) {
    redirect("/")
  }

  const locations = await getLocations()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage SPA locations</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle>{location.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {location.address && (
                <p className="text-sm text-muted-foreground">{location.address}</p>
              )}
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Users:</span> {location._count.users}
                </p>
                <p>
                  <span className="font-medium">Assigned Products:</span>{" "}
                  {location._count.assignments}
                </p>
                <p>
                  <span className="font-medium">Requisitions:</span> {location._count.requisitions}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No locations found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getLocations() {
  return await prisma.location.findMany({
    include: {
      _count: {
        select: {
          users: true,
          requisitions: true,
          assignments: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export default async function LocationsPage() {
  await requireAdmin()
  const locations = await getLocations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Locations</h1>
        <p className="text-muted-foreground">Manage SPA locations</p>
      </div>

      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle>{location.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {location.address && (
                <p className="text-sm text-muted-foreground mb-3">{location.address}</p>
              )}
              <div className="flex gap-4 text-sm">
                <span>{location._count.users} user(s)</span>
                <span>{location._count.requisitions} requisition(s)</span>
                <span>{location._count.assignments} product(s)</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

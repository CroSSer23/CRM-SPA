import { prisma } from "@/lib/prisma"
import { getRBACContext } from "@/lib/auth"
import { Role, RequisitionStatus } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

async function getRequisitionsByStatus(rbac: { userId: string; role: Role; locationIds: string[] }) {
  const where: any = {}

  if (rbac.role === Role.REQUESTER) {
    where.AND = [{ createdById: rbac.userId }, { locationId: { in: rbac.locationIds } }]
  }

  const requisitions = await prisma.requisition.findMany({
    where,
    include: {
      location: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      items: {
        select: {
          requestedQty: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  // Group by status
  const grouped: Record<RequisitionStatus, typeof requisitions> = {
    DRAFT: [],
    SUBMITTED: [],
    EDITED: [],
    ORDERED: [],
    PARTIALLY_RECEIVED: [],
    RECEIVED: [],
    CLOSED: [],
  }

  requisitions.forEach((req) => {
    grouped[req.status].push(req)
  })

  return grouped
}

export default async function DashboardPage() {
  const rbac = await getRBACContext()
  
  if (!rbac.user) {
    return <div>Please sign in</div>
  }

  // Get user's location IDs
  const userLocations = await prisma.locationUser.findMany({
    where: { userId: rbac.user.id },
    select: { locationId: true }
  })
  
  const locationIds = userLocations.map(loc => loc.locationId)

  const requisitionsByStatus = await getRequisitionsByStatus({
    userId: rbac.user.id,
    role: rbac.user.role,
    locationIds
  })

  const statuses: RequisitionStatus[] = [
    "SUBMITTED",
    "EDITED",
    "ORDERED",
    "PARTIALLY_RECEIVED",
    "RECEIVED",
    "CLOSED",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of all requisitions</p>
        </div>
        <Link
          href="/requisitions/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          New Requisition
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statuses.map((status) => {
          const reqs = requisitionsByStatus[status]
          return (
            <Card key={status}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-medium">
                  <StatusBadge status={status} />
                  <span className="text-muted-foreground">({reqs.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reqs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No requisitions</p>
                ) : (
                  reqs.map((req) => (
                    <Link key={req.id} href={`/requisitions/${req.id}`}>
                      <Card className="cursor-pointer transition-shadow hover:shadow-md">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium">{req.location.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.items.length} items
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(req.createdAt)}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


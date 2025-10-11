import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { RequisitionStatus } from "@prisma/client"
import { formatDate } from "@/lib/utils"

async function getRequisitionsByStatus(userId: string, userRole: string) {
  const where: any = {}
  
  if (userRole === 'REQUESTER') {
    where.createdById = userId
  }
  
  const requisitions = await prisma.requisition.findMany({
    where,
    include: {
      location: true,
      createdBy: {
        select: {
          name: true
        }
      },
      items: {
        select: {
          requestedQty: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
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
  const user = await requireUser()
  const requisitionsByStatus = await getRequisitionsByStatus(user.id, user.role)

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
        <Link href="/requisitions/new">
          <Button>New Requisition</Button>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => (
          <div key={status} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-xs text-muted-foreground">
                    {requisitionsByStatus[status].length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {requisitionsByStatus[status].map((req) => (
                  <Link key={req.id} href={`/requisitions/${req.id}`}>
                    <div className="p-3 rounded-lg border bg-white hover:shadow-md transition-all cursor-pointer">
                      <p className="font-medium text-sm mb-1">{req.location.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {req.createdBy.name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{req.items.length} items</span>
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {requisitionsByStatus[status].length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-muted-foreground">No items</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
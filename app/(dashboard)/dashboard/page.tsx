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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <Card key={status}>
            <CardHeader>
              <StatusBadge status={status} />
            </CardHeader>
            <CardContent className="space-y-2">
              {requisitionsByStatus[status].map((req) => (
                <Link key={req.id} href={`/requisitions/${req.id}`}>
                  <div className="p-3 rounded border hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="font-medium text-sm">{req.location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.items.length} items • {formatDate(req.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
              {requisitionsByStatus[status].length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No items</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
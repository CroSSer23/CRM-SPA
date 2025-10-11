import { prisma } from "@/lib/prisma"
import { getRBACContext } from "@/lib/auth"
import { Role } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils"

async function getRequisitions(rbac: { userId: string; role: Role; locationIds: string[] }) {
  const where: any = {}

  if (rbac.role === Role.REQUESTER) {
    where.AND = [{ createdById: rbac.userId }, { locationId: { in: rbac.locationIds } }]
  }

  return await prisma.requisition.findMany({
    where,
    include: {
      location: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function RequisitionsPage() {
  const rbac = await getRBACContext()
  const requisitions = await getRequisitions(rbac)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requisitions</h1>
          <p className="text-muted-foreground">Manage your purchase requisitions</p>
        </div>
        <Link href="/requisitions/new">
          <Button>New Requisition</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {requisitions.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">No requisitions found</p>
            </CardContent>
          </Card>
        ) : (
          requisitions.map((req) => (
            <Link key={req.id} href={`/requisitions/${req.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{req.location.name}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {req.items.length} items • Created by {req.createdBy.name} on{" "}
                      {formatDate(req.createdAt)}
                    </p>
                    {req.note && (
                      <p className="text-sm text-muted-foreground">Note: {req.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {req.poNumber && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">PO Number</p>
                        <p className="text-sm font-medium">{req.poNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}


import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

async function getRequisitions(userId: string, userRole: string, locationIds: string[]) {
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
          requestedQty: true,
          product: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return requisitions
}

export default async function RequisitionsPage() {
  const user = await requireUser()
  const locationIds = user.locations.map(l => l.locationId)
  const requisitions = await getRequisitions(user.id, user.role, locationIds)

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
        {requisitions.map((req) => (
          <Link key={req.id} href={`/requisitions/${req.id}`}>
            <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{req.location.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      By {req.createdBy.name} • {formatDate(req.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {req.items.length} item(s)
                </p>
                {req.note && (
                  <p className="text-sm mt-2">{req.note}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {requisitions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No requisitions yet</p>
              <Link href="/requisitions/new">
                <Button className="mt-4">Create Your First Requisition</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

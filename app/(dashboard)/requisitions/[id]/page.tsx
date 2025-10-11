import { requireUser, canAccessRequisition } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

async function getRequisition(id: string) {
  return await prisma.requisition.findUnique({
    where: { id },
    include: {
      location: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      },
      history: {
        include: {
          actor: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      attachments: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })
}

export default async function RequisitionDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser()
  const requisition = await getRequisition(params.id)

  if (!requisition) {
    notFound()
  }

  if (!canAccessRequisition(user.role, requisition.createdById, user.id)) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/requisitions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{requisition.location.name}</h1>
          <p className="text-muted-foreground">
            Created by {requisition.createdBy.name} • {formatDateTime(requisition.createdAt)}
          </p>
        </div>
        <StatusBadge status={requisition.status} />
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisition Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requisition.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.product.category?.name} • Unit: {item.product.unit}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>Requested: {item.requestedQty}</p>
                      {item.approvedQty && <p>Approved: {item.approvedQty}</p>}
                      {item.receivedQty ? <p>Received: {item.receivedQty}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requisition.history.map((log) => (
                  <div key={log.id} className="border-l-2 border-primary pl-4">
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.actor.name} • {formatDateTime(log.createdAt)}
                    </p>
                    {log.message && (
                      <p className="text-sm mt-1">{log.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {requisition.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No documents yet</p>
              ) : (
                <div className="space-y-2">
                  {requisition.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{att.type}</span>
                      <a href={att.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">View</Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

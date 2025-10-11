import { prisma } from "@/lib/prisma"
import { getRBACContext, canAccessRequisition } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { formatDateTime } from "@/lib/utils"
import { UNIT_LABELS, ACTION_LABELS } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
          role: true,
          clerkId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      history: {
        include: {
          actor: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      attachments: {
        include: {
          uploadedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })
}

export default async function RequisitionDetailPage({ params }: { params: { id: string } }) {
  const rbac = await getRBACContext()
  const requisition = await getRequisition(params.id)

  if (!requisition) {
    notFound()
  }

  if (!canAccessRequisition(rbac, requisition)) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{requisition.location.name}</h1>
            <StatusBadge status={requisition.status} />
          </div>
          <p className="text-muted-foreground">
            Created by {requisition.createdBy.name} on {formatDateTime(requisition.createdAt)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {requisition.note && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{requisition.note}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-4 border-b pb-2 text-sm font-medium">
                  <div className="col-span-2">Product</div>
                  <div className="text-right">Requested</div>
                  <div className="text-right">Approved</div>
                  <div className="text-right">Received</div>
                  <div>Status</div>
                </div>
                {requisition.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-6 gap-4 border-b py-3 text-sm">
                    <div className="col-span-2">
                      <p className="font-medium">{item.product.name}</p>
                      {item.product.category && (
                        <p className="text-xs text-muted-foreground">
                          {item.product.category.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {item.requestedQty} {UNIT_LABELS[item.product.unit]}
                    </div>
                    <div className="text-right">
                      {item.approvedQty
                        ? `${item.approvedQty} ${UNIT_LABELS[item.product.unit]}`
                        : "-"}
                    </div>
                    <div className="text-right">
                      {item.receivedQty !== null
                        ? `${item.receivedQty} ${UNIT_LABELS[item.product.unit]}`
                        : "-"}
                    </div>
                    <div>
                      {item.receivedQty !== null && item.receivedQty >= (item.approvedQty || 0)
                        ? "✓ Complete"
                        : item.receivedQty !== null
                          ? "⚠ Partial"
                          : "-"}
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
                  <div key={log.id} className="flex gap-4 border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{log.actor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ACTION_LABELS[log.action] || log.action}
                        </p>
                      </div>
                      {log.fromStatus && log.toStatus && (
                        <p className="text-sm text-muted-foreground">
                          Status changed from {log.fromStatus} to {log.toStatus}
                        </p>
                      )}
                      {log.message && <p className="text-sm">{log.message}</p>}
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {requisition.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents attached</p>
              ) : (
                <div className="space-y-2">
                  {requisition.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between border-b py-2">
                      <div>
                        <p className="font-medium">{att.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded by {att.uploadedBy.name} on {formatDateTime(att.createdAt)}
                        </p>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {requisition.poNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">PO Number:</span> {requisition.poNumber}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


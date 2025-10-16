"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Requisition {
  id: string
  status: string
  note?: string
  poNumber?: string
  invoiceId?: string
  createdAt: string
  location: { name: string }
  createdBy: { name: string; email: string; role: string }
  items: Array<{
    id: string
    requestedQty: number
    approvedQty?: number
    receivedQty?: number
    product: {
      name: string
      unit: string
      category?: { name: string }
    }
  }>
  history: Array<{
    id: string
    action: string
    message?: string
    createdAt: string
    actor: { name: string }
  }>
  attachments: Array<{
    id: string
    url: string
    type: string
  }>
}

export default function RequisitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [requisition, setRequisition] = useState<Requisition | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [receiveData, setReceiveData] = useState<Record<string, number>>({})

  useEffect(() => {
    loadRequisition()
  }, [params.id])

  const loadRequisition = async () => {
    const res = await fetch(`/api/requisitions/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setRequisition(data.requisition)
      
      // Initialize receive data
      const initial: Record<string, number> = {}
      data.requisition.items.forEach((item: any) => {
        initial[item.id] = item.receivedQty || 0
      })
      setReceiveData(initial)
    }
    setLoading(false)
  }

  const handleChangeStatus = async () => {
    const res = await fetch(`/api/requisitions/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
    
    if (res.ok) {
      setStatusDialogOpen(false)
      await loadRequisition()
      // Show success toast
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      toast.textContent = 'Статус успішно змінено'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 3000)
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  }

  const handleReceive = async () => {
    const items = Object.entries(receiveData).map(([id, receivedQty]) => ({
      id,
      receivedQty
    }))
    
    const res = await fetch(`/api/requisitions/${params.id}/receive`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    })
    
    if (res.ok) {
      setReceiveDialogOpen(false)
      loadRequisition()
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!requisition) {
    return <div>Requisition not found</div>
  }

  const canManage = requisition.createdBy.role !== 'ADMIN' // Simplified - in real app check current user role

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/requisitions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{requisition.location.name}</h1>
          <p className="text-sm text-muted-foreground">
            By {requisition.createdBy.name} • {new Date(requisition.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={requisition.status as any} />
        <Button onClick={() => { setNewStatus(requisition.status); setStatusDialogOpen(true) }}>
          Change Status
        </Button>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button onClick={() => setReceiveDialogOpen(true)}>Receive Items</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requisition.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.product.category?.name} • {item.product.unit}
                      </p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Requested</p>
                          <p className="font-medium">{item.requestedQty}</p>
                        </div>
                        {item.approvedQty !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Approved</p>
                            <p className="font-medium">{item.approvedQty}</p>
                          </div>
                        )}
                        {item.receivedQty !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Received</p>
                            <p className="font-medium text-green-600">{item.receivedQty}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requisition.history.map((log) => (
                  <div key={log.id} className="border-l-2 border-primary pl-4 pb-4">
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.actor.name} • {new Date(log.createdAt).toLocaleString()}
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

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {requisition.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No documents</p>
              ) : (
                <div className="space-y-2">
                  {requisition.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{att.type}</span>
                      <Button size="sm" variant="outline" asChild>
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>Update requisition status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="EDITED">Edited</SelectItem>
                  <SelectItem value="ORDERED">Ordered</SelectItem>
                  <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangeStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Items Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive Items</DialogTitle>
            <DialogDescription>Enter received quantities</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {requisition.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 border rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested: {item.requestedQty} • Approved: {item.approvedQty || item.requestedQty}
                  </p>
                </div>
                <div className="w-24">
                  <Label className="text-xs">Received</Label>
                  <Input
                    type="number"
                    min="0"
                    value={receiveData[item.id] || 0}
                    onChange={(e) => setReceiveData({
                      ...receiveData,
                      [item.id]: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleReceive}>Confirm Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
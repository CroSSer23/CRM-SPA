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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">Overview of all requisitions</p>
        </div>
        <Link href="/requisitions/new">
          <Button className="text-xs sm:text-sm">
            <span className="hidden sm:inline">New Requisition</span>
            <span className="sm:hidden">+ New</span>
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 flex-1" style={{ scrollbarWidth: 'thin' }}>
        {statuses.map((status) => (
          <div key={status} className="flex-shrink-0" style={{ width: '280px', minWidth: '280px' }}>
            <div className="bg-slate-100 rounded-lg p-3 h-full flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <StatusBadge status={status} />
                <span className="text-sm font-semibold text-slate-600">
                  {requisitionsByStatus[status].length}
                </span>
              </div>
              
              {/* Cards Container */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1" style={{ maxHeight: 'calc(100vh - 280px)', scrollbarWidth: 'thin' }}>
                {requisitionsByStatus[status].map((req) => (
                  <Link key={req.id} href={`/requisitions/${req.id}`}>
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-3 border border-slate-200">
                      {/* Card Title */}
                      <h3 className="font-semibold text-sm mb-2 text-slate-900">
                        {req.location.name}
                      </h3>
                      
                      {/* Card Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate">{req.createdBy.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{req.items.length} items</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px]">{formatDate(req.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {requisitionsByStatus[status].length === 0 && (
                  <div className="text-center py-6 text-slate-400">
                    <svg className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-xs">No items</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
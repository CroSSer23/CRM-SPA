import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RequisitionStatus } from "@prisma/client"
import { KanbanBoard } from "@/components/kanban-board"

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">
            {user.role === 'ADMIN' || user.role === 'PROCUREMENT' 
              ? 'Drag cards to change status' 
              : 'Overview of all requisitions'}
          </p>
        </div>
        <Link href="/requisitions/new">
          <Button className="text-xs sm:text-sm">
            <span className="hidden sm:inline">New Requisition</span>
            <span className="sm:hidden">+ New</span>
          </Button>
        </Link>
      </div>

      <KanbanBoard initialData={requisitionsByStatus} userRole={user.role} />
    </div>
  )
}
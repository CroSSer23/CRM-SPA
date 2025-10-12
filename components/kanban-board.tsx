"use client"

import { useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { RequisitionStatus } from "@prisma/client"
import { formatDate } from "@/lib/utils"

interface Requisition {
  id: string
  status: RequisitionStatus
  location: {
    name: string
  }
  createdBy: {
    name: string
  }
  items: Array<{
    requestedQty: number
  }>
  createdAt: Date
}

interface KanbanBoardProps {
  initialData: Record<RequisitionStatus, Requisition[]>
  userRole: string
}

export function KanbanBoard({ initialData, userRole }: KanbanBoardProps) {
  const [requisitionsByStatus, setRequisitionsByStatus] = useState(initialData)
  const [draggedItem, setDraggedItem] = useState<{ id: string; fromStatus: RequisitionStatus } | null>(null)

  const statuses: RequisitionStatus[] = [
    "SUBMITTED",
    "EDITED",
    "ORDERED",
    "PARTIALLY_RECEIVED",
    "RECEIVED",
    "CLOSED",
  ]

  const canChangeStatus = userRole === 'ADMIN' || userRole === 'PROCUREMENT'

  const handleDragStart = (e: React.DragEvent, reqId: string, status: RequisitionStatus) => {
    if (!canChangeStatus) return
    
    setDraggedItem({ id: reqId, fromStatus: status })
    e.dataTransfer.effectAllowed = 'move'
    
    // Add visual feedback
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
    setDraggedItem(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, toStatus: RequisitionStatus) => {
    e.preventDefault()
    
    if (!draggedItem || !canChangeStatus) return
    
    const { id: reqId, fromStatus } = draggedItem
    
    // Don't do anything if dropped in same column
    if (fromStatus === toStatus) {
      setDraggedItem(null)
      return
    }

    // Optimistically update UI
    const newData = { ...requisitionsByStatus }
    const reqIndex = newData[fromStatus].findIndex(r => r.id === reqId)
    
    if (reqIndex === -1) return
    
    const [movedReq] = newData[fromStatus].splice(reqIndex, 1)
    movedReq.status = toStatus
    newData[toStatus].unshift(movedReq)
    
    setRequisitionsByStatus(newData)
    setDraggedItem(null)

    // Update on server
    try {
      const res = await fetch(`/api/requisitions/${reqId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toStatus })
      })

      if (!res.ok) {
        // Revert on error
        setRequisitionsByStatus(initialData)
      }
    } catch (error) {
      // Revert on error
      setRequisitionsByStatus(initialData)
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 flex-1" style={{ scrollbarWidth: 'thin' }}>
      {statuses.map((status) => (
        <div 
          key={status} 
          className="flex-shrink-0" 
          style={{ width: '280px', minWidth: '280px' }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
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
                <div
                  key={req.id}
                  draggable={canChangeStatus}
                  onDragStart={(e) => handleDragStart(e, req.id, status)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-3 border border-slate-200 ${
                    canChangeStatus ? 'cursor-move' : 'cursor-pointer'
                  }`}
                >
                  <Link href={`/requisitions/${req.id}`} className="block">
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
                          <span className="text-[10px]">{formatDate(new Date(req.createdAt))}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {canChangeStatus && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <span>Drag to change status</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {requisitionsByStatus[status].length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  <svg className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-xs">No items</p>
                  {canChangeStatus && (
                    <p className="text-[10px] mt-1">Drop cards here</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


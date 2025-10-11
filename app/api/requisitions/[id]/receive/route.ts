import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RequisitionStatus } from "@prisma/client"
import { z } from "zod"

const receiveSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    receivedQty: z.number().int().min(0),
  })),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser()
    const body = await request.json()
    
    const validation = receiveSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const { items } = validation.data
    
    const existingReq = await prisma.requisition.findUnique({
      where: { id: params.id },
      include: {
        items: true
      }
    })
    
    if (!existingReq) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    
    // Update items
    await Promise.all(
      items.map(item =>
        prisma.requisitionItem.update({
          where: { id: item.id },
          data: { receivedQty: item.receivedQty }
        })
      )
    )
    
    // Check if fully received
    const updatedItems = await prisma.requisitionItem.findMany({
      where: { requisitionId: params.id }
    })
    
    const totalReceived = updatedItems.reduce((sum, item) => sum + (item.receivedQty || 0), 0)
    const totalApproved = updatedItems.reduce((sum, item) => sum + (item.approvedQty || item.requestedQty), 0)
    
    const newStatus = totalReceived >= totalApproved 
      ? RequisitionStatus.RECEIVED 
      : RequisitionStatus.PARTIALLY_RECEIVED
    
    const requisition = await prisma.requisition.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        history: {
          create: {
            actorId: user.id,
            action: 'RECEIVE',
            fromStatus: existingReq.status,
            toStatus: newStatus,
            message: `Items received`
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    return NextResponse.json({ requisition })
  } catch (error) {
    console.error("Receive error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

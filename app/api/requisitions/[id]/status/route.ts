import { NextResponse } from "next/server"
import { requireUser, canChangeStatus } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RequisitionStatus } from "@prisma/client"
import { z } from "zod"

const changeStatusSchema = z.object({
  status: z.nativeEnum(RequisitionStatus),
  poNumber: z.string().optional(),
  invoiceId: z.string().optional(),
  message: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser()
    
    if (!canChangeStatus(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const validation = changeStatusSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const { status, poNumber, invoiceId, message } = validation.data
    
    const existingReq = await prisma.requisition.findUnique({
      where: { id: params.id }
    })
    
    if (!existingReq) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    
    const requisition = await prisma.requisition.update({
      where: { id: params.id },
      data: {
        status,
        poNumber: poNumber || existingReq.poNumber,
        invoiceId: invoiceId || existingReq.invoiceId,
        history: {
          create: {
            actorId: user.id,
            action: 'STATUS_CHANGE',
            fromStatus: existingReq.status,
            toStatus: status,
            message: message || `Status changed to ${status}`
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
    console.error("Change status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

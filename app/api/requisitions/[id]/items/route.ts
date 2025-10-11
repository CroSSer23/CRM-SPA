import { NextResponse } from "next/server"
import { requireProcurement } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RequisitionStatus } from "@prisma/client"
import { z } from "zod"

const editItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    approvedQty: z.number().int().positive(),
  })),
  message: z.string().min(1, "Comment is required when editing items"),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireProcurement()
    const body = await request.json()
    
    const validation = editItemsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const { items, message } = validation.data
    
    const existingReq = await prisma.requisition.findUnique({
      where: { id: params.id }
    })
    
    if (!existingReq) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    
    // Update items
    await Promise.all(
      items.map(item =>
        prisma.requisitionItem.update({
          where: { id: item.id },
          data: { approvedQty: item.approvedQty }
        })
      )
    )
    
    // Update requisition status to EDITED and add history
    const requisition = await prisma.requisition.update({
      where: { id: params.id },
      data: {
        status: RequisitionStatus.EDITED,
        history: {
          create: {
            actorId: user.id,
            action: 'EDIT',
            fromStatus: existingReq.status,
            toStatus: RequisitionStatus.EDITED,
            message
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
    console.error("Edit items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

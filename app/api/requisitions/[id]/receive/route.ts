import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canReceiveItems } from "@/lib/auth"
import { receiveRequisitionItemsSchema } from "@/lib/validations"
import { notifyRequisitionStatusChange } from "@/lib/notifications"
import { ApiResponse } from "@/lib/types"
import { RequisitionStatus } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    // Parse request body
    const body = await request.json()
    const validationResult = receiveRequisitionItemsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { items, comment, updatedAt } = validationResult.data

    // Get existing requisition
    const existingRequisition = await prisma.requisition.findUnique({
      where: { id },
      include: {
        location: true,
        createdBy: true,
        items: true,
      },
    })

    if (!existingRequisition) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Requisition not found" },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canReceiveItems(rbac, existingRequisition)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to receive items" },
        { status: 403 }
      )
    }

    // Optimistic locking check
    if (existingRequisition.updatedAt.toISOString() !== updatedAt) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Requisition has been modified by another user. Please refresh and try again.",
        },
        { status: 409 }
      )
    }

    // Update items and determine new status
    let newStatus = existingRequisition.status

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existingItem = existingRequisition.items.find((i) => i.id === item.id)
        if (!existingItem) continue

        await tx.requisitionItem.update({
          where: { id: item.id },
          data: {
            receivedQty: item.receivedQty,
          },
        })
      }

      // Check if all items are received
      const updatedItems = await tx.requisitionItem.findMany({
        where: { requisitionId: id },
      })

      const allReceived = updatedItems.every(
        (item) => item.receivedQty !== null && item.receivedQty >= (item.approvedQty || 0)
      )

      const someReceived = updatedItems.some(
        (item) => item.receivedQty !== null && item.receivedQty > 0
      )

      if (allReceived) {
        newStatus = RequisitionStatus.RECEIVED
      } else if (someReceived) {
        newStatus = RequisitionStatus.PARTIALLY_RECEIVED
      }

      await tx.requisition.update({
        where: { id },
        data: {
          status: newStatus,
          history: {
            create: {
              actorId: rbac.userId,
              action: "RECEIVE",
              fromStatus: existingRequisition.status,
              toStatus: newStatus,
              message: comment || "Items received",
            },
          },
        },
      })
    })

    // Get updated requisition
    const updatedRequisition = await prisma.requisition.findUnique({
      where: { id },
      include: {
        location: true,
        createdBy: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        history: {
          include: {
            actor: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    // Send notification
    if (updatedRequisition && newStatus !== existingRequisition.status) {
      try {
        await notifyRequisitionStatusChange(
          {
            requisitionId: updatedRequisition.id,
            locationName: updatedRequisition.location.name,
            createdByName: updatedRequisition.createdBy.name,
            fromStatus: existingRequisition.status,
            toStatus: newStatus,
            message: comment,
          },
          updatedRequisition.createdBy.email
        )
      } catch (notifyError) {
        console.error("Failed to send notifications:", notifyError)
      }
    }

    return NextResponse.json<ApiResponse<typeof updatedRequisition>>({
      success: true,
      data: updatedRequisition,
      message: "Items received successfully",
    })
  } catch (error) {
    console.error(`PATCH /api/requisitions/${params.id}/receive error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


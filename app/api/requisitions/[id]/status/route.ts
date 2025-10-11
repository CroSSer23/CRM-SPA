import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canChangeRequisitionStatus } from "@/lib/auth"
import { updateRequisitionStatusSchema } from "@/lib/validations"
import { notifyRequisitionStatusChange } from "@/lib/notifications"
import { ApiResponse } from "@/lib/types"
import { RequisitionStatus } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    // Check permissions
    if (!canChangeRequisitionStatus(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to change requisition status" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = updateRequisitionStatusSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { status, comment, updatedAt, poNumber, invoiceId } = validationResult.data

    // Optimistic locking check
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

    if (existingRequisition.updatedAt.toISOString() !== updatedAt) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Requisition has been modified by another user. Please refresh and try again.",
        },
        { status: 409 }
      )
    }

    // Business rule: Can only close if all items are fully received
    if (status === RequisitionStatus.CLOSED) {
      const allReceived = existingRequisition.items.every(
        (item) => item.receivedQty !== null && item.receivedQty >= (item.approvedQty || 0)
      )

      if (!allReceived) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Cannot close: not all items are fully received" },
          { status: 400 }
        )
      }
    }

    // Update requisition
    const updatedRequisition = await prisma.requisition.update({
      where: { id },
      data: {
        status,
        poNumber: poNumber || existingRequisition.poNumber,
        invoiceId: invoiceId || existingRequisition.invoiceId,
        history: {
          create: {
            actorId: rbac.userId,
            action: status === RequisitionStatus.ORDERED ? "ORDER" : "EDIT",
            fromStatus: existingRequisition.status,
            toStatus: status,
            message: comment,
          },
        },
      },
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

    // Send notifications
    try {
      await notifyRequisitionStatusChange(
        {
          requisitionId: updatedRequisition.id,
          locationName: updatedRequisition.location.name,
          createdByName: updatedRequisition.createdBy.name,
          fromStatus: existingRequisition.status,
          toStatus: status,
          message: comment,
        },
        updatedRequisition.createdBy.email
      )
    } catch (notifyError) {
      console.error("Failed to send notifications:", notifyError)
    }

    return NextResponse.json<ApiResponse<typeof updatedRequisition>>({
      success: true,
      data: updatedRequisition,
      message: "Status updated successfully",
    })
  } catch (error) {
    console.error(`PATCH /api/requisitions/${params.id}/status error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canEditRequisition } from "@/lib/auth"
import { updateRequisitionItemsSchema } from "@/lib/validations"
import { notifyRequisitionEdited } from "@/lib/notifications"
import { ApiResponse } from "@/lib/types"
import { RequisitionStatus } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    // Parse request body
    const body = await request.json()
    const validationResult = updateRequisitionItemsSchema.safeParse(body)

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
    if (!canEditRequisition(rbac, existingRequisition)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to edit this requisition" },
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

    // Update items
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.requisitionItem.update({
          where: { id: item.id },
          data: {
            requestedQty: item.requestedQty,
            approvedQty: item.approvedQty,
            note: item.note,
          },
        })
      }

      // If procurement edited, change status to EDITED
      const newStatus =
        rbac.role === "PROCUREMENT" || rbac.role === "ADMIN"
          ? RequisitionStatus.EDITED
          : existingRequisition.status

      await tx.requisition.update({
        where: { id },
        data: {
          status: newStatus,
          history: {
            create: {
              actorId: rbac.userId,
              action: "EDIT",
              fromStatus: existingRequisition.status,
              toStatus: newStatus,
              message: comment,
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

    // Send notification if procurement edited
    if (
      (rbac.role === "PROCUREMENT" || rbac.role === "ADMIN") &&
      updatedRequisition &&
      rbac.userId !== updatedRequisition.createdById
    ) {
      try {
        await notifyRequisitionEdited(
          {
            requisitionId: updatedRequisition.id,
            locationName: updatedRequisition.location.name,
            createdByName: updatedRequisition.createdBy.name,
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
      message: "Items updated successfully",
    })
  } catch (error) {
    console.error(`PATCH /api/requisitions/${params.id}/items error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext } from "@/lib/auth"
import { createAttachmentSchema } from "@/lib/validations"
import { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const rbac = await getRBACContext()

    // Parse request body
    const body = await request.json()
    const validationResult = createAttachmentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { requisitionId, url, type } = validationResult.data

    // If requisitionId is provided, check access
    if (requisitionId) {
      const requisition = await prisma.requisition.findUnique({
        where: { id: requisitionId },
      })

      if (!requisition) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Requisition not found" },
          { status: 404 }
        )
      }

      // Check if user can access this requisition
      if (
        rbac.role === "REQUESTER" &&
        requisition.createdById !== rbac.userId &&
        !rbac.locationIds.includes(requisition.locationId)
      ) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "You don't have access to this requisition" },
          { status: 403 }
        )
      }
    }

    const attachment = await prisma.attachment.create({
      data: {
        requisitionId,
        url,
        type,
        uploadedById: rbac.userId,
      },
      include: {
        uploadedBy: true,
      },
    })

    return NextResponse.json<ApiResponse<typeof attachment>>(
      { success: true, data: attachment, message: "Attachment created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/attachments error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


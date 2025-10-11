import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canAccessRequisition } from "@/lib/auth"
import { ApiResponse, RequisitionWithDetails } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    const requisition = await prisma.requisition.findUnique({
      where: { id },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            clerkId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        history: {
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                clerkId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                clerkId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!requisition) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Requisition not found" },
        { status: 404 }
      )
    }

    // Check access permissions
    if (!canAccessRequisition(rbac, requisition)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to view this requisition" },
        { status: 403 }
      )
    }

    return NextResponse.json<ApiResponse<RequisitionWithDetails>>({
      success: true,
      data: requisition,
    })
  } catch (error) {
    console.error(`GET /api/requisitions/${params.id} error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    const requisition = await prisma.requisition.findUnique({
      where: { id },
    })

    if (!requisition) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Requisition not found" },
        { status: 404 }
      )
    }

    // Check if user can delete (only DRAFT requisitions by owner or ADMIN)
    const canDelete =
      rbac.role === "ADMIN" ||
      (requisition.createdById === rbac.userId && requisition.status === "DRAFT")

    if (!canDelete) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to delete this requisition" },
        { status: 403 }
      )
    }

    await prisma.requisition.delete({
      where: { id },
    })

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Requisition deleted successfully",
    })
  } catch (error) {
    console.error(`DELETE /api/requisitions/${params.id} error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


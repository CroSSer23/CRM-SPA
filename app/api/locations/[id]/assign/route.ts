import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageLocations } from "@/lib/auth"
import { assignProductToLocationSchema } from "@/lib/validations"
import { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    if (!canManageLocations(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to manage locations" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = assignProductToLocationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { productId, minStock, preferredQty } = validationResult.data

    const assignment = await prisma.locationProduct.upsert({
      where: {
        locationId_productId: {
          locationId: id,
          productId,
        },
      },
      create: {
        locationId: id,
        productId,
        minStock,
        preferredQty,
      },
      update: {
        minStock,
        preferredQty,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse<typeof assignment>>({
      success: true,
      data: assignment,
      message: "Product assigned to location successfully",
    })
  } catch (error) {
    console.error(`POST /api/locations/${params.id}/assign error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


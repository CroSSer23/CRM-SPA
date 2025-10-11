import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageCatalog } from "@/lib/auth"
import { updateProductSchema } from "@/lib/validations"
import { ApiResponse, ProductWithCategory } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await getRBACContext()
    const { id } = params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<ProductWithCategory>>({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error(`GET /api/products/${params.id} error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    if (!canManageCatalog(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to manage catalog" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = updateProductSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data: validationResult.data,
      include: {
        category: true,
      },
    })

    return NextResponse.json<ApiResponse<ProductWithCategory>>({
      success: true,
      data: product,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error(`PATCH /api/products/${params.id} error:`, error)
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

    if (!canManageCatalog(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to manage catalog" },
        { status: 403 }
      )
    }

    // Instead of deleting, mark as inactive
    await prisma.product.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Product deactivated successfully",
    })
  } catch (error) {
    console.error(`DELETE /api/products/${params.id} error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageCatalog } from "@/lib/auth"
import { createCategorySchema } from "@/lib/validations"
import { ApiResponse } from "@/lib/types"
import { Category } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    await getRBACContext()

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json<ApiResponse<typeof categories>>({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("GET /api/categories error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rbac = await getRBACContext()

    if (!canManageCatalog(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to manage catalog" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = createCategorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: validationResult.data,
    })

    return NextResponse.json<ApiResponse<Category>>(
      { success: true, data: category, message: "Category created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/categories error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageCatalog } from "@/lib/auth"
import { createProductSchema, productQuerySchema } from "@/lib/validations"
import { ApiResponse, PaginatedResponse, ProductWithCategory } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    await getRBACContext()
    const { searchParams } = new URL(request.url)

    // Parse and validate query params
    const queryResult = productQuerySchema.safeParse({
      categoryId: searchParams.get("categoryId") || undefined,
      active: searchParams.get("active") || undefined,
      q: searchParams.get("q") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
    })

    if (!queryResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: queryResult.error.message },
        { status: 400 }
      )
    }

    const { categoryId, active, q, page, limit } = queryResult.data

    // Build where clause
    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (active !== undefined) {
      where.active = active
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ]
    }

    // Get total count
    const total = await prisma.product.count({ where })

    // Get paginated results
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    const response: PaginatedResponse<ProductWithCategory> = {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("GET /api/products error:", error)
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
    const validationResult = createProductSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: validationResult.data,
      include: {
        category: true,
      },
    })

    return NextResponse.json<ApiResponse<ProductWithCategory>>(
      { success: true, data: product, message: "Product created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/products error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


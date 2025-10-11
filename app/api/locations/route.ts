import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageLocations } from "@/lib/auth"
import { createLocationSchema } from "@/lib/validations"
import { ApiResponse } from "@/lib/types"
import { Location } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const rbac = await getRBACContext()

    // Requesters only see their locations
    const where: any = {}
    if (rbac.role === "REQUESTER") {
      where.id = { in: rbac.locationIds }
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            users: true,
            assignments: true,
            requisitions: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse<typeof locations>>({
      success: true,
      data: locations,
    })
  } catch (error) {
    console.error("GET /api/locations error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rbac = await getRBACContext()

    if (!canManageLocations(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to manage locations" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = createLocationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: validationResult.data,
    })

    return NextResponse.json<ApiResponse<Location>>(
      { success: true, data: location, message: "Location created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/locations error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


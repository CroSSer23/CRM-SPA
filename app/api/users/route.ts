import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageUsers } from "@/lib/auth"
import { ApiResponse, UserWithLocations } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const rbac = await getRBACContext()

    if (!canManageUsers(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to manage users" },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      include: {
        locations: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json<ApiResponse<UserWithLocations[]>>({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


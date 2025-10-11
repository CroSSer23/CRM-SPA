import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageUsers } from "@/lib/auth"
import { assignUserToLocationSchema } from "@/lib/validations"
import { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rbac = await getRBACContext()
    const { id } = params

    if (!canManageUsers(rbac)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have permission to manage users" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = assignUserToLocationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { locationId } = validationResult.data

    const assignment = await prisma.locationUser.create({
      data: {
        userId: id,
        locationId,
      },
      include: {
        location: true,
      },
    })

    return NextResponse.json<ApiResponse<typeof assignment>>(
      { success: true, data: assignment, message: "User assigned to location successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error(`POST /api/users/${params.id}/locations error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageUsers } from "@/lib/auth"
import { updateUserRoleSchema } from "@/lib/validations"
import { ApiResponse } from "@/lib/types"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const validationResult = updateUserRoleSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { role } = validationResult.data

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      include: {
        locations: {
          include: {
            location: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse<typeof user>>({
      success: true,
      data: user,
      message: "User role updated successfully",
    })
  } catch (error) {
    console.error(`PATCH /api/users/${params.id}/role error:`, error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


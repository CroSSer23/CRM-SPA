import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Role } from "@prisma/client"

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()
    
    const validation = updateRoleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: validation.data.role }
    })
    
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

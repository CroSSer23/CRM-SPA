import { NextResponse } from "next/server"
import { requireProcurement } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCategorySchema = z.object({
  name: z.string().min(1),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireProcurement()
    const body = await request.json()
    
    const validation = updateCategorySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const category = await prisma.category.update({
      where: { id: params.id },
      data: validation.data
    })
    
    return NextResponse.json({ category })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireProcurement()
    
    await prisma.category.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

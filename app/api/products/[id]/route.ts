import { NextResponse } from "next/server"
import { requireProcurement } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Unit } from "@prisma/client"

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional(),
  unit: z.nativeEnum(Unit).optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    })
    
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireProcurement()
    const body = await request.json()
    
    const validation = updateProductSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        category: true
      }
    })
    
    return NextResponse.json({ product })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireProcurement()
    
    await prisma.product.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

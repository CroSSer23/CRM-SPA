import { NextResponse } from "next/server"
import { requireProcurement } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Unit } from "@prisma/client"

const createProductSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1),
  unit: z.nativeEnum(Unit),
  categoryId: z.string().optional(),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireProcurement()
    const body = await request.json()
    
    const validation = createProductSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const product = await prisma.product.create({
      data: validation.data,
      include: {
        category: true
      }
    })
    
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

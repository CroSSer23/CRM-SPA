import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const assignLocationSchema = z.object({
  locationId: z.string(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()
    
    const validation = assignLocationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const locationUser = await prisma.locationUser.create({
      data: {
        userId: params.id,
        locationId: validation.data.locationId
      }
    })
    
    return NextResponse.json({ locationUser }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    
    if (!locationId) {
      return NextResponse.json({ error: "locationId required" }, { status: 400 })
    }
    
    await prisma.locationUser.deleteMany({
      where: {
        userId: params.id,
        locationId
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

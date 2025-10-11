import { NextResponse } from "next/server"
import { requireUser, requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createLocationSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
})

export async function GET() {
  try {
    const user = await requireUser()
    
    const where: any = {}
    
    // REQUESTER sees only their locations
    if (user.role === 'REQUESTER') {
      const locationIds = user.locations.map(l => l.locationId)
      where.id = { in: locationIds }
    }
    
    const locations = await prisma.location.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            requisitions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json({ locations })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    
    const validation = createLocationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const location = await prisma.location.create({
      data: validation.data
    })
    
    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    console.error("Create location error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

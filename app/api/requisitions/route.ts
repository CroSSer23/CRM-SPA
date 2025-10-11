import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RequisitionStatus } from "@prisma/client"
import { z } from "zod"

const createRequisitionSchema = z.object({
  locationId: z.string(),
  note: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    requestedQty: z.number().int().positive(),
  })).min(1),
})

export async function GET(request: Request) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') as RequisitionStatus | null
    const locationId = searchParams.get('locationId')
    
    const where: any = {}
    
    // REQUESTER sees only their requisitions
    if (user.role === 'REQUESTER') {
      where.createdById = user.id
    }
    
    if (status) {
      where.status = status
    }
    
    if (locationId) {
      where.locationId = locationId
    }
    
    const requisitions = await prisma.requisition.findMany({
      where,
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ requisitions })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const body = await request.json()
    
    const validation = createRequisitionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }
    
    const { locationId, note, items } = validation.data
    
    // Check if user has access to this location
    const userLocationIds = user.locations.map(l => l.locationId)
    if (user.role === 'REQUESTER' && !userLocationIds.includes(locationId)) {
      return NextResponse.json({ error: "No access to this location" }, { status: 403 })
    }
    
    const requisition = await prisma.requisition.create({
      data: {
        locationId,
        createdById: user.id,
        status: RequisitionStatus.SUBMITTED,
        note,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            requestedQty: item.requestedQty,
          }))
        },
        history: {
          create: {
            actorId: user.id,
            action: 'SUBMIT',
            toStatus: RequisitionStatus.SUBMITTED,
            message: 'Requisition submitted'
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    return NextResponse.json({ requisition }, { status: 201 })
  } catch (error) {
    console.error("Create requisition error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

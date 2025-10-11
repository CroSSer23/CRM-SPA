import { NextResponse } from "next/server"
import { requireUser, canAccessRequisition } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser()
    
    const requisition = await prisma.requisition.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        history: {
          include: {
            actor: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attachments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    
    if (!requisition) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    
    if (!canAccessRequisition(user.role, requisition.createdById, user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    return NextResponse.json({ requisition })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

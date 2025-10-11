import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRBACContext } from "@/lib/auth"
import { createRequisitionSchema, requisitionQuerySchema } from "@/lib/validations"
import { Role, RequisitionStatus } from "@prisma/client"
import { notifyRequisitionSubmitted } from "@/lib/notifications"
import { ApiResponse, PaginatedResponse, RequisitionListItem } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const rbac = await getRBACContext()
    const { searchParams } = new URL(request.url)

    // Parse and validate query params
    const queryResult = requisitionQuerySchema.safeParse({
      status: searchParams.get("status") || undefined,
      locationId: searchParams.get("locationId") || undefined,
      q: searchParams.get("q") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    })

    if (!queryResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: queryResult.error.message },
        { status: 400 }
      )
    }

    const { status, locationId, q, page, limit } = queryResult.data

    // Build where clause based on role
    const where: any = {}

    if (rbac.role === Role.REQUESTER) {
      // Requesters can only see their own requisitions from their locations
      where.AND = [{ createdById: rbac.userId }, { locationId: { in: rbac.locationIds } }]
    } else if (rbac.role === Role.PROCUREMENT) {
      // Procurement can see all submitted/processed requisitions
      // Optionally filter by location
    }

    // Apply filters
    if (status) {
      where.status = status
    }

    if (locationId) {
      where.locationId = locationId
    }

    if (q) {
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { note: { contains: q, mode: "insensitive" } },
        { poNumber: { contains: q, mode: "insensitive" } },
      ]
    }

    // Get total count
    const total = await prisma.requisition.count({ where })

    // Get paginated results
    const requisitions = await prisma.requisition.findMany({
      where,
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            clerkId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        items: {
          select: {
            id: true,
            requestedQty: true,
            approvedQty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    const response: PaginatedResponse<RequisitionListItem> = {
      data: requisitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("GET /api/requisitions error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rbac = await getRBACContext()

    // Parse request body
    const body = await request.json()
    const validationResult = createRequisitionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      )
    }

    const { locationId, note, items } = validationResult.data

    // Check if user can create requisition for this location
    if (rbac.role === Role.REQUESTER && !rbac.locationIds.includes(locationId)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You don't have access to this location" },
        { status: 403 }
      )
    }

    // Create requisition with items (auto-submit)
    const requisition = await prisma.requisition.create({
      data: {
        locationId,
        createdById: rbac.userId,
        status: RequisitionStatus.SUBMITTED,
        note,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            requestedQty: item.requestedQty,
            note: item.note,
          })),
        },
        history: {
          create: {
            actorId: rbac.userId,
            action: "SUBMIT",
            toStatus: RequisitionStatus.SUBMITTED,
            message: "Requisition submitted",
          },
        },
      },
      include: {
        location: true,
        createdBy: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    // Send notifications
    try {
      const procurementUsers = await prisma.user.findMany({
        where: { role: Role.PROCUREMENT },
        select: { email: true },
      })

      for (const procUser of procurementUsers) {
        await notifyRequisitionSubmitted(
          {
            requisitionId: requisition.id,
            locationName: requisition.location.name,
            createdByName: requisition.createdBy.name,
          },
          procUser.email
        )
      }
    } catch (notifyError) {
      console.error("Failed to send notifications:", notifyError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json<ApiResponse<typeof requisition>>(
      { success: true, data: requisition, message: "Requisition created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/requisitions error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}


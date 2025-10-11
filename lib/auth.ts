import { auth, currentUser } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { RBACContext } from "./types"

export async function getCurrentUser() {
  const { userId } = auth()

  if (!userId) {
    return null
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    return null
  }

  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      locations: {
        include: {
          location: true,
        },
      },
    },
  })

  // If user doesn't exist, create them
  if (!user) {
    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      throw new Error("User email not found")
    }

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : email,
        role: Role.REQUESTER, // Default role
      },
      include: {
        locations: {
          include: {
            location: true,
          },
        },
      },
    })
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized: Insufficient permissions")
  }
  return user
}

export async function getRBACContext(): Promise<RBACContext> {
  const user = await requireAuth()
  const locationIds = user.locations.map((loc) => loc.location.id)

  return {
    userId: user.id,
    role: user.role,
    locationIds,
  }
}

export function canAccessRequisition(
  rbac: RBACContext,
  requisition: { createdById: string; locationId: string }
): boolean {
  // ADMIN and PROCUREMENT can access all requisitions
  if (rbac.role === Role.ADMIN || rbac.role === Role.PROCUREMENT) {
    return true
  }

  // REQUESTER can only access their own requisitions from their locations
  return (
    rbac.userId === requisition.createdById && rbac.locationIds.includes(requisition.locationId)
  )
}

export function canEditRequisition(
  rbac: RBACContext,
  requisition: { createdById: string; locationId: string; status: string }
): boolean {
  // PROCUREMENT and ADMIN can edit any requisition
  if (rbac.role === Role.ADMIN || rbac.role === Role.PROCUREMENT) {
    return true
  }

  // REQUESTER can edit their own DRAFT requisitions
  return (
    rbac.role === Role.REQUESTER &&
    rbac.userId === requisition.createdById &&
    rbac.locationIds.includes(requisition.locationId) &&
    requisition.status === "DRAFT"
  )
}

export function canChangeRequisitionStatus(rbac: RBACContext): boolean {
  return rbac.role === Role.ADMIN || rbac.role === Role.PROCUREMENT
}

export function canReceiveItems(rbac: RBACContext, requisition: { locationId: string }): boolean {
  // PROCUREMENT and ADMIN can receive
  if (rbac.role === Role.ADMIN || rbac.role === Role.PROCUREMENT) {
    return true
  }

  // REQUESTER can confirm receipt for their location
  return rbac.role === Role.REQUESTER && rbac.locationIds.includes(requisition.locationId)
}

export function canManageUsers(rbac: RBACContext): boolean {
  return rbac.role === Role.ADMIN
}

export function canManageLocations(rbac: RBACContext): boolean {
  return rbac.role === Role.ADMIN
}

export function canManageCatalog(rbac: RBACContext): boolean {
  return rbac.role === Role.ADMIN || rbac.role === Role.PROCUREMENT
}


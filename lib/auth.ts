import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    return user
  } catch (error) {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireUser()
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/')
  }
  
  return user
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN])
}

export async function requireProcurement() {
  return requireRole([Role.PROCUREMENT, Role.ADMIN])
}

// RBAC context for client components
export async function getRBACContext() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      user: null,
      isAdmin: false,
      isProcurement: false,
      isRequester: false,
      canManageRequisitions: false,
      canManageProducts: false,
      canManageUsers: false,
      canManageLocations: false,
    }
  }

  const isAdmin = user.role === Role.ADMIN
  const isProcurement = user.role === Role.PROCUREMENT
  const isRequester = user.role === Role.REQUESTER

  return {
    user,
    isAdmin,
    isProcurement,
    isRequester,
    canManageRequisitions: isAdmin || isProcurement,
    canManageProducts: isAdmin || isProcurement,
    canManageUsers: isAdmin,
    canManageLocations: isAdmin,
  }
}

// Helper functions for RBAC
export function canAccessRequisition(userRole: Role, requisitionUserId: string, currentUserId: string) {
  if (userRole === Role.ADMIN || userRole === Role.PROCUREMENT) {
    return true
  }
  
  return requisitionUserId === currentUserId
}

export function canEditRequisition(
  userRole: Role,
  requisitionUserId: string,
  currentUserId: string,
  status: string
) {
  if (!canAccessRequisition(userRole, requisitionUserId, currentUserId)) {
    return false
  }
  
  // Only PROCUREMENT and ADMIN can edit after submission
  if (status !== 'DRAFT' && userRole === Role.REQUESTER) {
    return false
  }
  
  return true
}

export function canChangeStatus(userRole: Role, fromStatus: string, toStatus: string) {
  // REQUESTER can only change DRAFT to SUBMITTED
  if (userRole === Role.REQUESTER) {
    return fromStatus === 'DRAFT' && toStatus === 'SUBMITTED'
  }
  
  // PROCUREMENT and ADMIN can change any status
  return true
}

export function canManageCatalog(userRole: Role) {
  return userRole === Role.ADMIN || userRole === Role.PROCUREMENT
}

export function canManageUsers(userRole: Role) {
  return userRole === Role.ADMIN
}
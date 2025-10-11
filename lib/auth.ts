import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { getSession } from "@/lib/jwt"

export async function getCurrentUser() {
  try {
    const session = await getSession()
    
    if (!session?.userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        locations: {
          select: {
            locationId: true
          }
        }
      }
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

export async function requireAdmin() {
  const user = await requireUser()
  
  if (user.role !== Role.ADMIN) {
    redirect('/dashboard')
  }
  
  return user
}

export async function requireProcurement() {
  const user = await requireUser()
  
  if (user.role !== Role.ADMIN && user.role !== Role.PROCUREMENT) {
    redirect('/dashboard')
  }
  
  return user
}

// RBAC helpers
export function canAccessRequisition(userRole: Role, requisitionUserId: string, currentUserId: string) {
  if (userRole === Role.ADMIN || userRole === Role.PROCUREMENT) {
    return true
  }
  return requisitionUserId === currentUserId
}

export function canEditRequisition(userRole: Role, status: string) {
  if (userRole === Role.ADMIN || userRole === Role.PROCUREMENT) {
    return true
  }
  return status === 'DRAFT'
}

export function canChangeStatus(userRole: Role) {
  return userRole === Role.ADMIN || userRole === Role.PROCUREMENT
}
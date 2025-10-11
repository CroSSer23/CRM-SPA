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
    redirect('/dashboard')
  }
  
  return user
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN])
}

export async function requireProcurement() {
  return requireRole([Role.PROCUREMENT, Role.ADMIN])
}

// Simple RBAC context - returns everything needed
export async function getRBACContext() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      user: null,
      userId: '',
      role: Role.REQUESTER as Role,
      locationIds: [] as string[],
      isAdmin: false,
      isProcurement: false,
      isRequester: false,
    }
  }

  // Get user's location IDs
  const userLocations = await prisma.locationUser.findMany({
    where: { userId: user.id },
    select: { locationId: true }
  })
  
  const locationIds = userLocations.map(loc => loc.locationId)

  const isAdmin = user.role === Role.ADMIN
  const isProcurement = user.role === Role.PROCUREMENT
  const isRequester = user.role === Role.REQUESTER

  return {
    user,
    userId: user.id,
    role: user.role,
    locationIds,
    isAdmin,
    isProcurement,
    isRequester,
  }
}
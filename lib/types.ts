import {
  User,
  Location,
  Category,
  Product,
  Requisition,
  RequisitionItem,
  ActivityLog,
  Attachment,
  Role,
  RequisitionStatus,
  Unit,
} from "@prisma/client"

// Extended types with relations
export type RequisitionWithDetails = Requisition & {
  location: Location
  createdBy: User
  items: (RequisitionItem & {
    product: Product & {
      category: Category | null
    }
  })[]
  history: (ActivityLog & {
    actor: User
  })[]
  attachments: (Attachment & {
    uploadedBy: User
  })[]
}

export type RequisitionListItem = Requisition & {
  location: Location
  createdBy: User
  items: {
    id: string
    requestedQty: number
    approvedQty: number | null
  }[]
}

export type UserWithLocations = User & {
  locations: {
    location: Location
  }[]
}

export type ProductWithCategory = Product & {
  category: Category | null
}

export type LocationWithAssignments = Location & {
  assignments: {
    product: ProductWithCategory
    minStock: number | null
    preferredQty: number | null
  }[]
}

// DTO types for API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Constants and maps
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  PROCUREMENT: "Procurement Officer",
  REQUESTER: "Requester",
}

export const STATUS_LABELS: Record<RequisitionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  EDITED: "Edited",
  ORDERED: "Ordered",
  PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CLOSED: "Closed",
}

export const STATUS_COLORS: Record<
  RequisitionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  EDITED: "default",
  ORDERED: "default",
  PARTIALLY_RECEIVED: "default",
  RECEIVED: "default",
  CLOSED: "outline",
}

export const UNIT_LABELS: Record<Unit, string> = {
  PCS: "pcs",
  ML: "ml",
  L: "L",
  G: "g",
  KG: "kg",
  PACK: "pack",
  BOX: "box",
}

export const ACTION_LABELS: Record<string, string> = {
  SUBMIT: "Submitted",
  EDIT: "Edited",
  ORDER: "Ordered",
  RECEIVE: "Received",
  CLOSE: "Closed",
  COMMENT: "Commented",
}

// RBAC helper types
export interface RBACContext {
  userId: string
  role: Role
  locationIds: string[]
}


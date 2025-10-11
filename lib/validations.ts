import { z } from "zod"
import { Role, RequisitionStatus, Unit } from "@prisma/client"

// User schemas
export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.nativeEnum(Role),
})

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(Role),
})

// Location schemas
export const createLocationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters"),
  address: z.string().optional(),
})

export const updateLocationSchema = createLocationSchema.partial()

export const assignUserToLocationSchema = z.object({
  userId: z.string(),
  locationId: z.string(),
})

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
})

export const updateCategorySchema = createCategorySchema.partial()

// Product schemas
export const createProductSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  unit: z.nativeEnum(Unit).default(Unit.PCS),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().default(true),
})

export const updateProductSchema = createProductSchema.partial()

export const assignProductToLocationSchema = z.object({
  locationId: z.string(),
  productId: z.string(),
  minStock: z.number().int().positive().optional(),
  preferredQty: z.number().int().positive().optional(),
})

// Requisition schemas
export const requisitionItemSchema = z.object({
  productId: z.string(),
  requestedQty: z.number().int().positive("Quantity must be positive"),
  note: z.string().optional(),
})

export const createRequisitionSchema = z.object({
  locationId: z.string(),
  note: z.string().optional(),
  items: z
    .array(requisitionItemSchema)
    .min(1, "At least one item is required to submit a requisition"),
})

export const updateRequisitionItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string().optional(),
      requestedQty: z.number().int().positive().optional(),
      approvedQty: z.number().int().positive().optional(),
      note: z.string().optional(),
    })
  ),
  comment: z.string().min(1, "Comment is required when editing items"),
  updatedAt: z.string().datetime(), // for optimistic locking
})

export const updateRequisitionStatusSchema = z.object({
  status: z.nativeEnum(RequisitionStatus),
  comment: z.string().optional(),
  updatedAt: z.string().datetime(), // for optimistic locking
  poNumber: z.string().optional(),
  invoiceId: z.string().optional(),
})

export const receiveRequisitionItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      receivedQty: z.number().int().min(0, "Received quantity cannot be negative"),
    })
  ),
  comment: z.string().optional(),
  updatedAt: z.string().datetime(), // for optimistic locking
})

// Attachment schemas
export const createAttachmentSchema = z.object({
  requisitionId: z.string().optional(),
  url: z.string().url(),
  type: z.enum(["PO", "INVOICE", "PHOTO"]),
})

// Query schemas
export const requisitionQuerySchema = z.object({
  status: z.nativeEnum(RequisitionStatus).optional(),
  locationId: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const productQuerySchema = z.object({
  categoryId: z.string().optional(),
  active: z.coerce.boolean().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// Type exports
export type CreateRequisition = z.infer<typeof createRequisitionSchema>
export type UpdateRequisitionItems = z.infer<typeof updateRequisitionItemsSchema>
export type UpdateRequisitionStatus = z.infer<typeof updateRequisitionStatusSchema>
export type ReceiveRequisitionItems = z.infer<typeof receiveRequisitionItemsSchema>
export type CreateProduct = z.infer<typeof createProductSchema>
export type CreateCategory = z.infer<typeof createCategorySchema>
export type CreateLocation = z.infer<typeof createLocationSchema>
export type RequisitionQuery = z.infer<typeof requisitionQuerySchema>
export type ProductQuery = z.infer<typeof productQuerySchema>


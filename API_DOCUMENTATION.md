# API Documentation

## Authentication

Всі API endpoints захищені Clerk authentication. Додайте Clerk session token до headers:

```
Authorization: Bearer <clerk-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Requisitions API

### List Requisitions
```http
GET /api/requisitions?status=SUBMITTED&locationId=xxx&q=search&page=1&limit=20
```

**Query Parameters:**
- `status` (optional): RequisitionStatus enum
- `locationId` (optional): Filter by location
- `q` (optional): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:** Paginated list of requisitions

---

### Create Requisition
```http
POST /api/requisitions
Content-Type: application/json

{
  "locationId": "clxxx",
  "note": "Monthly supplies",
  "items": [
    {
      "productId": "clyyy",
      "requestedQty": 10,
      "note": "Optional item note"
    }
  ]
}
```

**Validation:**
- `locationId`: Required, must exist
- `items`: Required, min 1 item
- `requestedQty`: Required, positive integer

**Response:** Created requisition (automatically SUBMITTED)

---

### Get Requisition Details
```http
GET /api/requisitions/{id}
```

**Response:** Full requisition with items, history, attachments

---

### Update Requisition Status
```http
PATCH /api/requisitions/{id}/status
Content-Type: application/json

{
  "status": "ORDERED",
  "comment": "Order placed with supplier",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "poNumber": "PO-2025-0001",
  "invoiceId": "INV-123"
}
```

**Validation:**
- `status`: Required, RequisitionStatus enum
- `updatedAt`: Required for optimistic locking
- `comment`: Optional
- `poNumber`: Optional
- `invoiceId`: Optional

**Business Rules:**
- Only PROCUREMENT/ADMIN can change status
- Cannot close unless all items fully received

---

### Update Requisition Items
```http
PATCH /api/requisitions/{id}/items
Content-Type: application/json

{
  "items": [
    {
      "id": "item-id",
      "approvedQty": 8,
      "note": "Reduced quantity due to stock"
    }
  ],
  "comment": "Adjusted quantities based on availability",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

**Validation:**
- `comment`: Required when editing
- `updatedAt`: Required for optimistic locking

---

### Receive Items
```http
PATCH /api/requisitions/{id}/receive
Content-Type: application/json

{
  "items": [
    {
      "id": "item-id",
      "receivedQty": 5
    }
  ],
  "comment": "Partial delivery received",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

**Auto Status Update:**
- All received → RECEIVED
- Some received → PARTIALLY_RECEIVED

---

### Delete Requisition
```http
DELETE /api/requisitions/{id}
```

**Rules:**
- Only DRAFT requisitions
- Only creator or ADMIN

---

## Products API

### List Products
```http
GET /api/products?categoryId=xxx&active=true&q=search&page=1&limit=50
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `active` (optional): Filter by active status
- `q` (optional): Search query
- `page` (optional): Page number
- `limit` (optional): Items per page (max: 100)

---

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Facial Cleanser",
  "sku": "SKN-001",
  "unit": "ML",
  "categoryId": "clxxx",
  "description": "Gentle cleanser",
  "active": true
}
```

**Permissions:** ADMIN or PROCUREMENT

---

### Update Product
```http
PATCH /api/products/{id}
Content-Type: application/json

{
  "name": "Updated name",
  "active": false
}
```

**Permissions:** ADMIN or PROCUREMENT

---

### Delete Product (Deactivate)
```http
DELETE /api/products/{id}
```

**Note:** Soft delete - sets `active = false`

---

## Categories API

### List Categories
```http
GET /api/categories
```

**Response:** All categories with product count

---

### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Skincare"
}
```

**Permissions:** ADMIN or PROCUREMENT

---

## Locations API

### List Locations
```http
GET /api/locations
```

**Rules:**
- ADMIN/PROCUREMENT: see all
- REQUESTER: see only assigned locations

---

### Create Location
```http
POST /api/locations
Content-Type: application/json

{
  "name": "Mayfair Spa",
  "address": "123 Berkeley Square, London"
}
```

**Permissions:** ADMIN only

---

### Assign Product to Location
```http
POST /api/locations/{id}/assign
Content-Type: application/json

{
  "productId": "clxxx",
  "minStock": 10,
  "preferredQty": 20
}
```

**Permissions:** ADMIN only

---

## Users API

### List Users
```http
GET /api/users
```

**Permissions:** ADMIN only

---

### Update User Role
```http
PATCH /api/users/{id}/role
Content-Type: application/json

{
  "userId": "clxxx",
  "role": "PROCUREMENT"
}
```

**Permissions:** ADMIN only

---

### Assign User to Location
```http
POST /api/users/{id}/locations
Content-Type: application/json

{
  "userId": "clxxx",
  "locationId": "clyyy"
}
```

**Permissions:** ADMIN only

---

## Attachments API

### Create Attachment
```http
POST /api/attachments
Content-Type: application/json

{
  "requisitionId": "clxxx",
  "url": "https://utfs.io/...",
  "type": "PO"
}
```

**Types:** PO, INVOICE, PHOTO

**Note:** First upload file via UploadThing, then create attachment record

---

## Enums

### RequisitionStatus
- DRAFT
- SUBMITTED
- EDITED
- ORDERED
- PARTIALLY_RECEIVED
- RECEIVED
- CLOSED

### Role
- ADMIN
- PROCUREMENT
- REQUESTER

### Unit
- PCS (Pieces)
- ML (Milliliters)
- L (Liters)
- G (Grams)
- KG (Kilograms)
- PACK
- BOX

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Optimistic locking failure |
| 500 | Internal Server Error |

---

## Rate Limits

Vercel Free Plan:
- 100 GB bandwidth/month
- 100 serverless function executions/day
- No hard rate limit on API calls

Production considerations:
- Implement rate limiting middleware
- Use Redis for distributed rate limiting
- Monitor usage via Vercel Analytics


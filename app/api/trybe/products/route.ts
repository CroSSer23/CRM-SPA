import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"

const TRYBE_API_URL = "https://api.try.be/inventory/products"
const TRYBE_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjYxZmQ3ODNhMDg5ZmQzNjFmZGU5YjdjMThhZjk2M2RiIn0.eyJhdWQiOiJUcnliZSIsImp0aSI6IjFkODhmMjdmZGQwNjg3ZjYwMGY3NmU3Njg0OWU4NTQ0MDY4MGUzN2FkYmJkZjIxY2E3OThkODZjMDc5YmE2Y2RhNDYxMDY0ZjgzZGVmODlkIiwiaWF0IjoxNzYwNjE5NDkxLjY4ODkxMSwibmJmIjoxNzYwNjE5NDkxLjY4ODkxNCwiZXhwIjoxNzYwNjIzMDkxLjY2NDAyOCwic3ViIjoiOWU0YmQ0ZDYtOGY2ZC00MmYwLWJlYTMtZTYxMzgyOTU0MDU3Iiwic2NvcGVzIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCIsIm9yZ2FuaXNhdGlvbnMiLCJzc28iXSwiaW50ZXJjb21fdXNlcl9oYXNoIjoiZjdiODRjMTRkMzIyMWYyM2EyODA4N2Y4MWI5OWUwNjMwNWZmNWUzZTc4MWJlNzkxNDFhODhhMzZkMTA0ZmI3ZCIsImlzX3N5c3RlbV91c2VyIjpmYWxzZX0.oeNT3V3rg0wVfE0ZOP5l8lBPeG4r3Pl8Nee9xg6ZNTQs2eZG5MPJ_CF8emoIS8S-F6Y0YfQkIFI9LjjSlPyudsI0NjvV8JiPTrjakUa4r7Qn-VnMrG5Zv7-MtIgeCW6wLC8_Pk6HZpwRJBmsQdWzeFRjsNy_zshfq4fy2p50Uh4My6C-v-K1Kd_fl45sYSBDdF5OKNH9fRrJWrTow2L4qq3YwcnwaGV4lRw40h-7-SVf7TQ-BT4P8EUDNQD64sW_H9CW4HsUpiQX1YSmtTc6LMcyV9AWeqrNuWmuxdFAA1AiOLdnbbQ1LI5GJA68d10mE1MUcLjgnROrWAYvaOHdX5igUOyq-tYEYSTt3R0F2bn5i1y6vca9ZM9VH90oND6ti8mwoXf32EeDFxW94zbV7iOfhwi0sz5OQOQqP8CeipFRNVmrwRUAb9Yr3UQ-U9okdEdP0LMOy3LVvhhhdxEeOg6C16OpTxCFffBYwLKhmKuu6GqP-o5K6DBdo3TxM1wJmltRlRLdTSLyau95CyLehbyBv5URh7OteJjoKFOa1sBB5rP5XDmNwYoahb6bZX5pS8D9ldcys5ZtOwmcmVd4X2bI3KCMslnfEVIKen_oy3y431GsV2q_Nou1Snxn53TF6K962ACb6XfVPz6sr_AQBjahW9dGpLx7QlRKNjc-62A"
const SITE_ID = "9bde3039-7660-4fab-97fc-a194dc4643d2"

export interface TrybeProduct {
  id: string
  name: string
  description: string | null
  barcode: number | null
  sku: string | null
  reorder_level: number | null
  currency: string
  brand_id: string | null
  category_id: string | null
  organisation_id: string
  site_id: string
  average_cost: number | null
  stock_value: number | null
  stock_level: number | null
}

export interface TrybeResponse {
  data: TrybeProduct[]
  meta: {
    from: number
    to: number
    total: number
    current_page: number
    last_page: number
    per_page: number
    path: string
  }
}

export async function GET(request: Request) {
  try {
    await requireUser()
    
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const query = searchParams.get("query") || ""
    
    const url = new URL(TRYBE_API_URL)
    url.searchParams.set("site_id", SITE_ID)
    url.searchParams.set("per_page", "300")
    url.searchParams.set("page", page)
    if (query) {
      url.searchParams.set("query", query)
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TRYBE_TOKEN}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      cache: "no-store"
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("TRYBE API Error:", response.status, errorText)
      return NextResponse.json(
        { error: "Failed to fetch products from TRYBE", details: errorText },
        { status: response.status }
      )
    }

    const data: TrybeResponse = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("TRYBE API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}


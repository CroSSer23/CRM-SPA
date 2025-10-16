import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"

const TRYBE_API_URL = "https://api.try.be/inventory/products"
const TRYBE_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjYxZmQ3ODNhMDg5ZmQzNjFmZGU5YjdjMThhZjk2M2RiIn0.eyJhdWQiOiJUcnliZSIsImp0aSI6IjFkODhmMjdmZGQwNjg3ZjYwMGY3NmU3Njg0OWU4NTQ0MDY4MGUzN2FkYmJkZjIxY2E3OThkODZjMDc5YmE2Y2RhNDYxMDY0ZjgzZGVmODlkIiwiaWF0IjoxNzYwNjE5NDkxLjY4ODkxMSwibmJmIjoxNzYwNjE5NDkxLjY4ODkxNCwiZXhwIjoxNzYwNjIzMDkxLjY2NDAyOCwic3ViIjoiOWU0YmQ0ZDYtOGY2ZC00MmYwLWJlYTMtZTYxMzgyOTU0MDU3Iiwic2NvcGVzIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCIsIm9yZ2FuaXNhdGlvbnMiLCJzc28iXSwiaW50ZXJjb21fdXNlcl9oYXNoIjoiZjdiODRjMTRkMzIyMWYyM2EyODA4N2Y4MWI5OWUwNjMwNWZmNWUzZTc4MWJlNzkxNDFhODhhMzZkMTA0ZmI3ZCIsImlzX3N5c3RlbV91c2VyIjpmYWxzZX0.oeNT3V3rg0wVfE0ZOP5l8lBPeG4r3Pl8Nee9xg6ZNTQs2eZG5MPJ_CF8emoIS8S-F6Y0YfQkIFI9LjjSlPyudsI0NjvV8JiPTrjakUa4r7Qn-VnMrG5Zv7-MtIgeCW6wLC8_Pk6HZpwRJBmsQdWzeFRjsNy_zshfq4fy2p50Uh4My6C-v-K1Kd_fl45sYSBDdF5OKNH9fRrJWrTow2L4qq3YwcnwaGV4lRw40h-7-SVf7TQ-BT4P8EUDNQD64sW_H9CW4HsUpiQX1YSmtTc6LMcyV9AWeqrNuWmuxdFAA1AiOLdnbbQ1LI5GJA68d10mE1MUcLjgnROrWAYvaOHdX5igUOyq-tYEYSTt3R0F2bn5i1y6vca9ZM9VH90oND6ti8mwoXf32EeDFxW94zbV7iOfhwi0sz5OQOQqP8CeipFRNVmrwRUAb9Yr3UQ-U9okdEdP0LMOy3LVvhhhdxEeOg6C16OpTxCFffBYwLKhmKuu6GqP-o5K6DBdo3TxM1wJmltRlRLdTSLyau95CyLehbyBv5URh7OteJjoKFOa1sBB5rP5XDmNwYoahb6bZX5pS8D9ldcys5ZtOwmcmVd4X2bI3KCMslnfEVIKen_oy3y431GsV2q_Nou1Snxn53TF6K962ACb6XfVPz6sr_AQBjahW9dGpLx7QlRKNjc-62A"

// GET - Отримати деталі продукту
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser()
    
    const response = await fetch(`${TRYBE_API_URL}/${params.id}`, {
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
        { error: "Failed to fetch product from TRYBE", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("TRYBE API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// PATCH - Оновити продукт
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser()
    
    const body = await request.json()
    
    console.log("=== TRYBE PATCH REQUEST ===")
    console.log("Product ID:", params.id)
    console.log("Request body:", body)
    console.log("URL:", `${TRYBE_API_URL}/${params.id}`)
    
    const response = await fetch(`${TRYBE_API_URL}/${params.id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${TRYBE_TOKEN}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("TRYBE API Error Response:", errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      
      return NextResponse.json(
        { 
          error: "Failed to update product in TRYBE", 
          details: errorData.message || errorData.error || errorText,
          errors: errorData.errors,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("TRYBE API Success Response:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("TRYBE PATCH Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}


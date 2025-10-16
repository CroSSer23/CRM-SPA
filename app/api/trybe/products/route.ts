import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"

const TRYBE_API_URL = "https://api.try.be/inventory/products"
const TRYBE_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjYxZmQ3ODNhMDg5ZmQzNjFmZGU5YjdjMThhZjk2M2RiIn0.eyJhdWQiOiJUcnliZSIsImp0aSI6IjJkOWE3NDIxZDA3YTRjOWEwYWY0MzA2MWJlNmExNTlmYTUzN2U1YjE5ZTI1MWJkZTFjYzgxYTExODA1M2FlZGFlZDEyZTBiNzVhYWNlOWZlIiwiaWF0IjoxNzYwNjIzMjA4LjU1NzY1LCJuYmYiOjE3NjA2MjMyMDguNTU3NjUzLCJleHAiOjE3NjA2MjY4MDguNTI0Mjc5LCJzdWIiOiI5ZTRiZDRkNi04ZjZkLTQyZjAtYmVhMy1lNjEzODI5NTQwNTciLCJzY29wZXMiOlsib3BlbmlkIiwicHJvZmlsZSIsImVtYWlsIiwib3JnYW5pc2F0aW9ucyIsInNzbyJdLCJpbnRlcmNvbV91c2VyX2hhc2giOiJmN2I4NGMxNGQzMjIxZjIzYTI4MDg3ZjgxYjk5ZTA2MzA1ZmY1ZTNlNzgxYmU3OTE0MWE4OGEzNmQxMDRmYjdkIiwiaXNfc3lzdGVtX3VzZXIiOmZhbHNlfQ.dJsa_KHft3DWsipxT4fDFq3ZS965IU9Gdyqj604kP8kVg4D5cs8_nDO-3gTsaD43q2Er2LzYyv9tsS_ENc0dXCEft3LkPx-d4e3ZV9wJ7JTYmGaR_hf9fe53vGz3BGXoHWx_uW-7shusvNvVswuMrjOe-ufqq8UHkHC9IwTkqdvQI05KNSxI1pp-oIq15trGkEokukJLMBOkw-agBwB-Cm9EtcfR8nfGa6-z2uvdyh117ay8R9kIzzmuN04fVi8hqAyP0mEDiJD6wBBGmxBXNqDrc9VIyztmFMnXrt-NzOUFO6zDsQFUMcLGKF7k0Nh-DcRr3kG6FyVRiBI1npvfbMGzBxCpL9S_ESqnW7KaIsaa3j0WyDDAxp7TyWH9MyVIJXbPle_ohvDkz23iAtO4z1hxj1q4PtgJ3qIFqt5Y8uNoicqwJ76zV7DPe4XK42xJg_R9IOZrF2B4LC2svtwmWrnpy0zJjDHOhd9BNAtfuhmDEgNccXqC9P3CSMYRMO0FJt5_bw24RpPN8qG9eLcwUDqv3rFD_bzPM4GPTP95aCY6yP8YmuUyfiDOnYTCfIrPfKHKfzhOWhTFkcI0nzEIrnOc39D3lm7vZ6U2ZpEHUDM1TJDHZIHEqvUxFFzSkmb8Kr0rbq_PdQPy5KsynkELAUTqcYZEUHWa-Fp5YTPubzE"
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


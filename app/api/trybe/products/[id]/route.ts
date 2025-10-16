import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"

const TRYBE_API_URL = "https://api.try.be/inventory/products"
const TRYBE_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjYxZmQ3ODNhMDg5ZmQzNjFmZGU5YjdjMThhZjk2M2RiIn0.eyJhdWQiOiJUcnliZSIsImp0aSI6IjJkOWE3NDIxZDA3YTRjOWEwYWY0MzA2MWJlNmExNTlmYTUzN2U1YjE5ZTI1MWJkZTFjYzgxYTExODA1M2FlZGFlZDEyZTBiNzVhYWNlOWZlIiwiaWF0IjoxNzYwNjIzMjA4LjU1NzY1LCJuYmYiOjE3NjA2MjMyMDguNTU3NjUzLCJleHAiOjE3NjA2MjY4MDguNTI0Mjc5LCJzdWIiOiI5ZTRiZDRkNi04ZjZkLTQyZjAtYmVhMy1lNjEzODI5NTQwNTciLCJzY29wZXMiOlsib3BlbmlkIiwicHJvZmlsZSIsImVtYWlsIiwib3JnYW5pc2F0aW9ucyIsInNzbyJdLCJpbnRlcmNvbV91c2VyX2hhc2giOiJmN2I4NGMxNGQzMjIxZjIzYTI4MDg3ZjgxYjk5ZTA2MzA1ZmY1ZTNlNzgxYmU3OTE0MWE4OGEzNmQxMDRmYjdkIiwiaXNfc3lzdGVtX3VzZXIiOmZhbHNlfQ.dJsa_KHft3DWsipxT4fDFq3ZS965IU9Gdyqj604kP8kVg4D5cs8_nDO-3gTsaD43q2Er2LzYyv9tsS_ENc0dXCEft3LkPx-d4e3ZV9wJ7JTYmGaR_hf9fe53vGz3BGXoHWx_uW-7shusvNvVswuMrjOe-ufqq8UHkHC9IwTkqdvQI05KNSxI1pp-oIq15trGkEokukJLMBOkw-agBwB-Cm9EtcfR8nfGa6-z2uvdyh117ay8R9kIzzmuN04fVi8hqAyP0mEDiJD6wBBGmxBXNqDrc9VIyztmFMnXrt-NzOUFO6zDsQFUMcLGKF7k0Nh-DcRr3kG6FyVRiBI1npvfbMGzBxCpL9S_ESqnW7KaIsaa3j0WyDDAxp7TyWH9MyVIJXbPle_ohvDkz23iAtO4z1hxj1q4PtgJ3qIFqt5Y8uNoicqwJ76zV7DPe4XK42xJg_R9IOZrF2B4LC2svtwmWrnpy0zJjDHOhd9BNAtfuhmDEgNccXqC9P3CSMYRMO0FJt5_bw24RpPN8qG9eLcwUDqv3rFD_bzPM4GPTP95aCY6yP8YmuUyfiDOnYTCfIrPfKHKfzhOWhTFkcI0nzEIrnOc39D3lm7vZ6U2ZpEHUDM1TJDHZIHEqvUxFFzSkmb8Kr0rbq_PdQPy5KsynkELAUTqcYZEUHWa-Fp5YTPubzE"

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

// PATCH - Оновити stock level (використовується фронтендом)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser()
    
    const body = await request.json()
    
    console.log("=== TRYBE INVENTORY PUT REQUEST ===")
    console.log("Product ID:", params.id)
    console.log("Request body:", body)
    console.log("URL:", `${TRYBE_API_URL}/${params.id}`)
    
    // Спочатку отримуємо поточний продукт
    const getResponse = await fetch(`${TRYBE_API_URL}/${params.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TRYBE_TOKEN}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    })

    if (!getResponse.ok) {
      const errorText = await getResponse.text()
      console.error("Failed to fetch current product:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch current product", details: errorText },
        { status: getResponse.status }
      )
    }

    const currentProduct = await getResponse.json()
    console.log("Current product data:", currentProduct.data)

    // Видаляємо readonly та вкладені поля (brand, category - це об'єкти, залишаємо тільки ID)
    const { brand, category, deleted_at, ...cleanData } = currentProduct.data
    
    // Мерджимо поточні дані з новими (PUT потребує всі поля)
    const updateData = {
      ...cleanData,
      ...body
    }
    
    console.log("Merged update data:", updateData)
    
    // Використовуємо PUT для inventory/products
    const response = await fetch(`${TRYBE_API_URL}/${params.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${TRYBE_TOKEN}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateData)
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
    console.error("TRYBE PUT Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}


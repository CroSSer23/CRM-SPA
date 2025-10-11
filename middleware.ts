import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

const protectedRoutes = [
  "/dashboard",
  "/requisitions",
  "/catalog",
  "/locations",
  "/users",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get("session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  // Verify token
  const session = await verifyToken(token)

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
}
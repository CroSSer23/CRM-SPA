export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/(dashboard)/:path*",
    "/api/requisitions/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/locations/:path*",
    "/api/users/:path*",
    "/api/attachments/:path*",
  ]
}
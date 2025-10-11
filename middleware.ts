import { clerkMiddleware } from "@clerk/nextjs/server"

// Simple middleware that protects all routes by default
// Clerk automatically handles public routes (sign-in, sign-up)
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}


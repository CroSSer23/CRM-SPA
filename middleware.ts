import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',  // Home/Landing page
  '/sign-in(.*)',  // Sign-in redirect page
  '/sign-up(.*)',  // Sign-up redirect page
  '/api/uploadthing(.*)',  // UploadThing needs to be public
  '/api/webhook(.*)',  // Webhooks need to be public
])

// Protect all routes except public ones
export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}


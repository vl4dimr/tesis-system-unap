import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow access to auth pages and public routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = ["/", "/login", "/register", "/api/auth"]

        // Check if current path is a public route
        const isPublicRoute = publicRoutes.some(route =>
          pathname === route || pathname.startsWith("/api/auth")
        )

        if (isPublicRoute) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

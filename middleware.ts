import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected routes that require authentication
const protectedPaths = ["/dashboard", "/settings", "/app", "/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  // Check for session cookie (edge-safe, no Auth.js import)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Pass pathname to server components via header
  const response = NextResponse.next()
  response.headers.set("x-next-pathname", pathname)
  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/app/:path*",
    "/admin/:path*",
  ],
}

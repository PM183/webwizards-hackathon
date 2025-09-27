import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    // Basic request validation
    const pathname = request.nextUrl.pathname

    // Block obviously malicious requests
    if (pathname.includes('..') ||
        pathname.includes('<script') ||
        pathname.includes('eval(') ||
        pathname.includes('union select') ||
        pathname.includes('drop table')) {
      return new NextResponse('Request blocked', { status: 403 })
    }

    // Process the request with Supabase auth
    const response = await updateSession(request)

    // Apply basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Basic CSP for Next.js + Supabase
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')

    response.headers.set('Content-Security-Policy', csp)

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
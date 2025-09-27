import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '../types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Debug logging for Vercel deployment
  console.log('Middleware executing:', {
    pathname,
    hasUser: !!user,
    userId: user?.id,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing'
  })

  // Define route patterns
  const authRoutes = ['/login', '/register']
  const protectedRoutes = ['/admin', '/student', '/polls']
  const adminRoutes = ['/admin']

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if current route requires admin privileges
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // If user is not authenticated and trying to access protected routes
  if (!user && isProtectedRoute) {
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access auth routes, redirect to appropriate dashboard
  if (user && isAuthRoute) {
    try {
      // Get user profile to determine role
      const { data: profile, error } = await (supabase
        .from('profiles') as any)
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('Middleware auth route redirect - Profile fetch:', { profile, error, userId: user.id })

      if (error) {
        console.error('Profile fetch error:', error)
        url.pathname = '/student'
        return NextResponse.redirect(url)
      }

      if ((profile as any)?.role === 'admin') {
        console.log('Redirecting admin to /admin')
        url.pathname = '/admin'
      } else {
        console.log('Redirecting user to /student')
        url.pathname = '/student'
      }
      return NextResponse.redirect(url)
    } catch (err) {
      console.error('Exception in profile fetch:', err)
      // If profile fetch fails, redirect to student dashboard as fallback
      url.pathname = '/student'
      return NextResponse.redirect(url)
    }
  }

  // If user is authenticated but not admin and trying to access admin routes
  if (user && isAdminRoute) {
    try {
      const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        url.pathname = '/student'
        return NextResponse.redirect(url)
      }
    } catch {
      // If profile fetch fails, redirect to student dashboard
      url.pathname = '/student'
      return NextResponse.redirect(url)
    }
  }

  // If user is on root path, redirect to appropriate dashboard
  if (user && pathname === '/') {
    try {
      const { data: profile, error } = await (supabase
        .from('profiles') as any)
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('Middleware root redirect - Profile fetch:', { profile, error, userId: user.id })

      if (error) {
        console.error('Root redirect profile fetch error:', error)
        url.pathname = '/student'
        return NextResponse.redirect(url)
      }

      if ((profile as any)?.role === 'admin') {
        console.log('Root redirect: admin to /admin')
        url.pathname = '/admin'
      } else {
        console.log('Root redirect: user to /student')
        url.pathname = '/student'
      }
      return NextResponse.redirect(url)
    } catch (err) {
      console.error('Exception in root redirect profile fetch:', err)
      url.pathname = '/student'
      return NextResponse.redirect(url)
    }
  }

  // If not authenticated and on root path, show landing page instead of redirect
  if (!user && pathname === '/') {
    return supabaseResponse
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
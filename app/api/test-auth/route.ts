import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Try to get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('Auth Debug:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    })

    if (userError) {
      return NextResponse.json({
        authenticated: false,
        error: userError.message,
        cookies: request.cookies.getAll().map(c => c.name)
      })
    }

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: 'No user found',
        cookies: request.cookies.getAll().map(c => c.name)
      })
    }

    // Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile,
      profileError: profileError?.message
    })

  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
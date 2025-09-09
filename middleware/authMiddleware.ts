import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function authMiddleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  if (!token && !['/login', '/register'].includes(req.nextUrl.pathname)) {
    const loginUrl = new URL('/login', req.nextUrl.origin)

    return NextResponse.redirect(loginUrl)
  }

  if (token && ['/login', '/register'].includes(req.nextUrl.pathname)) {
    const homeUrl = new URL('/', req.nextUrl.origin)

    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

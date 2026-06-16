import {NextRequest, NextResponse} from 'next/server';
import {UserRole, isRouteAllowed} from './src/lib/auth';

const PUBLIC_PATHS = ['/login', '/_next', '/favicon', '/api'];

export function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }
  const cookie = req.cookies.get('sp_user')?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  try {
    const user = JSON.parse(cookie) as {role: UserRole};
    if (user?.role && isRouteAllowed(user.role, pathname)) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};

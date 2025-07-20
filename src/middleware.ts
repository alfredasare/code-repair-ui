import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies or localStorage simulation via headers
  const authStorage = request.cookies.get('auth-storage')?.value;
  let token: string | null = null;
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token || null;
    } catch {
      token = null;
    }
  }
  
  const isAuthenticated = token ? await validateToken(token) : false;
  
  // Define protected and public routes
  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/sign-in' || pathname === '/';
  
  // If user is authenticated
  if (isAuthenticated) {
    // Redirect authenticated users away from auth pages
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to protected routes
    return NextResponse.next();
  }
  
  // If user is not authenticated
  if (isProtectedRoute) {
    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  // Allow access to public routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
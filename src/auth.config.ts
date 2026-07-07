import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const protectedPaths = ['/dashboard', '/analytics', '/crm', '/settings', '/profile'];
      const isProtectedRoute = protectedPaths.some((p) => nextUrl.pathname.startsWith(p));
      const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
      
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Automatically redirects to /login
      } else if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Populated in auth.ts
} satisfies NextAuthConfig;

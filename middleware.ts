import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes — only admins can access
    if (path.startsWith("/dashboard") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/chat", req.url));
    }

    // User chat routes — only non-admin users
    if (path.startsWith("/chat") && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Public routes
        if (path === "/" || path === "/login" || path === "/register") {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/chat/:path*", "/dashboard/:path*", "/login", "/register"],
};

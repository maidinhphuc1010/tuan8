import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
export default withAuth(
  function middleware(request) {
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      request.nextauth.token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  },
  { callbacks: { authorized: ({ token }) => Boolean(token) } },
);
export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };

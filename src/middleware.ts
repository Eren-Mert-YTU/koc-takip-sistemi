import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin rotaları
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/giris", req.url));
    }

    // Koç rotaları
    if (pathname.startsWith("/koc") && token?.role !== "COACH") {
      return NextResponse.redirect(new URL("/auth/giris", req.url));
    }

    // Öğrenci rotaları
    if (pathname.startsWith("/ogrenci") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/auth/giris", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/koc/:path*", "/ogrenci/:path*"],
};

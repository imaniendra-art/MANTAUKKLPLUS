import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token || token.error === "UserDeleted") {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/mahasiswa') && token.role !== 'mahasiswa') {
      if (token.role === 'dpl' && path.startsWith('/mahasiswa/laporan/cetak/laporan')) {
        // allow DPL to view
      } else if (token.role === 'lppm' && path.startsWith('/mahasiswa/laporan/templates/pengantar')) {
        // allow Admin to view
      } else {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (token.role === 'mahasiswa') {
      const isFirstLogin = token.isFirstLogin === true;
      const isSetupPage = path === '/mahasiswa/setup-akun';

      // Jika mahasiswa baru login pertama kali dan bukan di halaman setup, paksa ke setup
      if (isFirstLogin && !isSetupPage) {
        return NextResponse.redirect(new URL('/mahasiswa/setup-akun', req.url));
      }

      // Jika sudah selesai setup (isFirstLogin false) tapi mencoba masuk ke halaman setup, kembalikan ke dashboard
      if (!isFirstLogin && isSetupPage) {
        return NextResponse.redirect(new URL('/mahasiswa', req.url));
      }
    }
    
    if (path.startsWith('/dpl') && token.role !== 'dpl') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/admin') && token.role !== 'lppm') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/mentor') && token.role !== 'mentor') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  matcher: ['/mahasiswa/:path*', '/dpl/:path*', '/admin/:path*', '/mentor/:path*'],
};

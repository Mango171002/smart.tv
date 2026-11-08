import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, negotiateLocale } from '@/i18n/config';

/** Locale routing: `/x` → `/{best locale}/x` (cookie, then Accept-Language, then EN). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = LOCALES.find((l) => l === cookieLocale) ?? negotiateLocale(request.headers.get('accept-language'));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|icon|robots.txt|sitemap.xml|.*\\..*).*)'],
};

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "ef_session";
const DEVICE_COOKIE = "ef_device";
const PREVIEW_COOKIE = "ef_preview"; // "vendor" when a staff user is previewing the vendor view

const PUBLIC_PATHS = ["/login", "/pin"];

// Next.js 16 renamed the `middleware` file convention to `proxy` (see
// node_modules/next/dist/docs/.../file-conventions/proxy.md). This only
// checks for *presence* of the auth cookies — the mock in-memory data store
// isn't guaranteed to be shared between this and the page/server-action
// runtime once deployed, so pages under /vendor and /planner re-verify the
// real user + role server-side (see app/vendor/layout.tsx, app/planner/layout.tsx).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const hasDevice = Boolean(request.cookies.get(DEVICE_COOKIE)?.value);
  const preview = request.cookies.get(PREVIEW_COOKIE)?.value;

  if (!hasSession) {
    const dest = hasDevice ? "/pin" : "/login";
    if (pathname !== dest) {
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/vendor") && preview === "vendor") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

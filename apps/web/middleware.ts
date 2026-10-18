import { NextResponse, type NextRequest } from "next/server";

/** Maintenance: while true, every page shows /maintenance (the site is being reworked). Set it to false
    and deploy to bring the site back; nothing else needs to change. */
const MAINTENANCE = true;

export function middleware(req: NextRequest) {
  const onPage = req.nextUrl.pathname === "/maintenance";
  if (!MAINTENANCE) return onPage ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  if (onPage) return NextResponse.next();
  return NextResponse.rewrite(new URL("/maintenance", req.url));
}

/* Pages only: Next's own files, favicon requests, and the API are left alone. */
export const config = { matcher: ["/((?!_next/|api/|favicon.ico).*)"] };

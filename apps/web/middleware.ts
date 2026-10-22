import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Maintenance: while true, every page shows /maintenance (the site is being reworked). Set it to false
    and deploy to bring the site back; nothing else needs to change. The editor is not affected. */
const MAINTENANCE = true;

const isEditorPath = (p: string) => p === "/editor" || p.startsWith("/editor/") || p.startsWith("/api/editor/");

/* The editor lives on editor.ryux.design. On that host "/" opens the editor and site pages do not exist;
   on ryux.design the editor does not exist. Locally (localhost) both work, at /editor. */
export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const path = req.nextUrl.pathname;
  const editorHost = host.startsWith("editor.");
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (editorHost || isEditorPath(path)) {
    if (!editorHost && !local) return new NextResponse(null, { status: 404 });
    if (editorHost && path === "/") return withNoIndex(NextResponse.redirect(new URL("/editor", req.url)));
    if (!isEditorPath(path)) return new NextResponse(null, { status: 404 });
    return withNoIndex(await refreshSession(req));
  }

  const onPage = path === "/maintenance";
  if (!MAINTENANCE) return onPage ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  if (onPage || path.startsWith("/api/")) return NextResponse.next();
  return NextResponse.rewrite(new URL("/maintenance", req.url));
}

/** Keeps the editor's Supabase session fresh (cookies), as @supabase/ssr expects from middleware. */
async function refreshSession(req: NextRequest): Promise<NextResponse> {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        for (const c of list) req.cookies.set(c.name, c.value);
        res = NextResponse.next({ request: req });
        for (const c of list) res.cookies.set(c.name, c.value, c.options);
      },
    },
  });
  await sb.auth.getUser();
  return res;
}

function withNoIndex(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

/* Pages and the editor API; Next's own files and favicon requests are left alone. */
export const config = { matcher: ["/((?!_next/|favicon.ico).*)"] };

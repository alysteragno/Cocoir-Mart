import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── Fetch role once ──
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null
  }

  const isAdmin = role === "admin"
  const isLoggedIn = !!user

  // ── /seller → must be logged in + admin ──
  if (pathname.startsWith("/seller")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/login", request.url));
    if (!isAdmin) return NextResponse.redirect(new URL("/", request.url));
  }

  // ── / → admin goes to seller dashboard ──
  if (pathname === "/" && isAdmin) {
    return NextResponse.redirect(new URL("/seller/dashboard", request.url));
  }

  // ── /products → public, but admin gets redirected ──
  if (pathname.startsWith("/products")) {
    if (isAdmin) return NextResponse.redirect(new URL("/seller/dashboard", request.url));
  }

  // ── Protected customer routes → must be logged in, admin blocked ──
  if (
    pathname.startsWith("/orders") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/profile")
  ) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/login", request.url));
    if (isAdmin) return NextResponse.redirect(new URL("/seller/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/seller/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/profile/:path*",
  ],
};
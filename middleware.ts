// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  // Create a Supabase client that works inside middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") || "",
        },
      },
    }
  );

  // 1) Get the user from the request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in → send to login page
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 2) Get the profile and check is_admin
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile in middleware:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!profile?.is_admin) {
    // Logged in but not an admin → send to homepage
    return NextResponse.redirect(new URL("/", req.url));
  }

  // All good → continue
  return NextResponse.next();
}

// Apply only to /admin/* routes
export const config = {
  matcher: ["/admin/:path*"],
};

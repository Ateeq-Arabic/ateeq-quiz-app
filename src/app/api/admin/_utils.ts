import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);

/**
 * Verifies the Authorization: Bearer <access_token> header belongs to an admin.
 * Throws/returns a NextResponse on failure.
 */
export async function ensureAdmin(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  // Get user by token (server call)
  const {
    data: { user },
    error: userErr,
  } = await supabaseAdmin.auth.getUser(token);

  if (userErr || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check profiles table for is_admin
  const { data: profile, error: pErr } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (pErr) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // success: return user id (or user object) so caller can continue
  return { user };
}

// --- Safe deletion helper for shared media files ---
export async function safeDeleteFile(bucket: string, path: string) {
  if (!path) return;

  try {
    // Check if the same path is still referenced elsewhere
    const { data: stillUsedOpts } = await supabaseAdmin
      .from("options")
      .select("id")
      .or(`image_path.eq.${path},audio_path.eq.${path}`);

    const { data: stillUsedQs } = await supabaseAdmin
      .from("questions")
      .select("id")
      .or(`prompt_image_path.eq.${path},prompt_audio_path.eq.${path}`);

    const stillUsed = (stillUsedOpts?.length ?? 0) + (stillUsedQs?.length ?? 0);

    if (stillUsed === 0) {
      await supabaseAdmin.storage.from(bucket).remove([path]);
      console.log(`Deleted unused file from ${bucket}: ${path}`);
    } else {
      console.log(
        `Skipped deleting ${path} — still used in ${stillUsed} record(s)`
      );
    }
  } catch (err) {
    console.warn(`Failed safeDeleteFile for ${path}:`, err);
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin, ensureAdmin } from "@/app/api/admin/_utils";
import { safeDeleteFile } from "@/app/api/admin/_utils";

export async function POST(req: Request) {
  // verify admin
  const adminCheck = await ensureAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { optionId } = await req.json();

    // 1. Fetch option file paths
    const { data: option, error: fetchError } = await supabaseAdmin
      .from("options")
      .select("image_path, audio_path")
      .eq("id", optionId)
      .single();

    if (fetchError) {
      console.error("Fetch option failed:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    // 2. Delete DB row first
    const { error: delError } = await supabaseAdmin
      .from("options")
      .delete()
      .eq("id", optionId);

    if (delError) {
      console.error("Delete option row failed:", delError);
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    // 3. Delete files from storage (if any)
    if (option.image_path) {
      await safeDeleteFile("quiz-images", option.image_path);
    }

    if (option.audio_path) {
      await safeDeleteFile("quiz-audio", option.audio_path);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error;
    console.error("Delete option failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

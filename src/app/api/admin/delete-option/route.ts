import { NextResponse } from "next/server";
import { supabaseAdmin, ensureAdmin } from "@/app/api/admin/_utils";

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
      const { error: imgErr } = await supabaseAdmin.storage
        .from("quiz-images")
        .remove([option.image_path]);
      if (imgErr) console.warn("Failed to delete image:", imgErr);
    }

    if (option.audio_path) {
      const { error: audErr } = await supabaseAdmin.storage
        .from("quiz-audio")
        .remove([option.audio_path]);
      if (audErr) console.warn("Failed to delete audio:", audErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error;
    console.error("Delete option failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

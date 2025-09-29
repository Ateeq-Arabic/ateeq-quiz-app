import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ⚠️ server-only
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export async function POST(req: Request) {
  try {
    const { optionId } = await req.json();

    // 1. Fetch option
    const { data: option, error: oError } = await supabaseAdmin
      .from("options")
      .select("image_path, audio_path")
      .eq("id", optionId)
      .single();

    if (oError) throw oError;

    // 2. Collect file paths
    const imagePaths: string[] = [];
    const audioPaths: string[] = [];

    if (option?.image_path) imagePaths.push(option.image_path);
    if (option?.audio_path) audioPaths.push(option.audio_path);

    // 3. Delete from storage
    if (imagePaths.length) {
      await supabaseAdmin.storage.from("quiz-images").remove(imagePaths);
    }
    if (audioPaths.length) {
      await supabaseAdmin.storage.from("quiz-audio").remove(audioPaths);
    }

    // 4. Delete the option row
    const { error: delError } = await supabaseAdmin
      .from("options")
      .delete()
      .eq("id", optionId);

    if (delError) throw delError;

    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error;
    console.error("Delete option failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin, ensureAdmin } from "@/app/api/admin/_utils";

export async function POST(req: Request) {
  // verify admin
  const adminCheck = await ensureAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { questionId } = await req.json();

    // 1. Fetch the question
    const { data: question, error: qError } = await supabaseAdmin
      .from("questions")
      .select("id, prompt_image_path, prompt_audio_path")
      .eq("id", questionId)
      .single();

    if (qError) throw qError;

    // 2. Fetch its options
    const { data: options, error: oError } = await supabaseAdmin
      .from("options")
      .select("image_path, audio_path")
      .eq("question_id", questionId);

    if (oError) throw oError;

    // 3. Collect file paths
    const imagePaths: string[] = [];
    const audioPaths: string[] = [];

    if (question?.prompt_image_path)
      imagePaths.push(question.prompt_image_path);
    if (question?.prompt_audio_path)
      audioPaths.push(question.prompt_audio_path);

    for (const o of options ?? []) {
      if (o.image_path) imagePaths.push(o.image_path);
      if (o.audio_path) audioPaths.push(o.audio_path);
    }

    // 4. Delete from storage
    if (imagePaths.length) {
      await supabaseAdmin.storage.from("quiz-images").remove(imagePaths);
    }
    if (audioPaths.length) {
      await supabaseAdmin.storage.from("quiz-audio").remove(audioPaths);
    }

    // 5. Delete the question row (cascade deletes options)
    const { error: delError } = await supabaseAdmin
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (delError) throw delError;

    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error;
    console.error("Delete question failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

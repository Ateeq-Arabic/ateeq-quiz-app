import { NextResponse } from "next/server";
import { supabaseAdmin, ensureAdmin } from "@/app/api/admin/_utils";
import { safeDeleteFile } from "@/app/api/admin/_utils";

export async function POST(req: Request) {
  // verify admin
  const adminCheck = await ensureAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { quizId } = await req.json();

    // 1. Fetch questions for this quiz
    const { data: questions, error: qError } = await supabaseAdmin
      .from("questions")
      .select("id, prompt_image_path, prompt_audio_path")
      .eq("quiz_id", quizId);

    if (qError) throw qError;

    const questionIds = (questions ?? []).map((q) => q.id);

    // 2. Fetch options separately
    let options: { image_path: string | null; audio_path: string | null }[] =
      [];
    if (questionIds.length > 0) {
      const { data: optData, error: oError } = await supabaseAdmin
        .from("options")
        .select("image_path, audio_path")
        .in("question_id", questionIds);

      if (oError) throw oError;
      options = optData ?? [];
    }

    // 3. Collect file paths
    const imagePaths: string[] = [];
    const audioPaths: string[] = [];

    for (const q of questions ?? []) {
      if (q.prompt_image_path) imagePaths.push(q.prompt_image_path);
      if (q.prompt_audio_path) audioPaths.push(q.prompt_audio_path);
    }

    for (const o of options) {
      if (o.image_path) imagePaths.push(o.image_path);
      if (o.audio_path) audioPaths.push(o.audio_path);
    }

    // 4. Delete from storage
    for (const path of imagePaths) {
      await safeDeleteFile("quiz-images", path);
    }
    for (const path of audioPaths) {
      await safeDeleteFile("quiz-audio", path);
    }

    // 5. Delete quiz row (cascade will remove questions/options)
    const { error: delError } = await supabaseAdmin
      .from("quizzes")
      .delete()
      .eq("id", quizId);

    if (delError) throw delError;

    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error;
    console.error("Delete quiz failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

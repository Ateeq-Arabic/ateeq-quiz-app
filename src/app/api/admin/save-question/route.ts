import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// shape of response returned from SQL function
type SaveQuestionResponse = {
  question_id: string;
  temp_map: Record<string, string>;
  deleted_option_files?: {
    image_path?: string;
    audio_path?: string;
  }[];
};

export async function POST(req: Request) {
  try {
    const { quizId, question } = await req.json();

    // Call the atomic SQL function
    const { data, error } = await supabase.rpc("save_question_atomic", {
      quiz_id: quizId,
      question_data: question,
    });

    if (error) {
      console.error("DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const resp = data as SaveQuestionResponse;

    // 🔥 Cleanup deleted files (if provided by SQL)
    if (resp.deleted_option_files && resp.deleted_option_files.length > 0) {
      for (const f of resp.deleted_option_files) {
        if (f.image_path) {
          const { error: delErr } = await supabase.storage
            .from("quiz-images")
            .remove([f.image_path]);
          if (delErr) console.warn("Failed to delete old image:", delErr);
        }
        if (f.audio_path) {
          const { error: delErr } = await supabase.storage
            .from("quiz-audio")
            .remove([f.audio_path]);
          if (delErr) console.warn("Failed to delete old audio:", delErr);
        }
      }
    }

    return NextResponse.json({ data: resp });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Server crash:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

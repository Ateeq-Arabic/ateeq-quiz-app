"use client";

import type { QuizQuestion, QuizOption } from "@/features/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { uploadFile } from "@/lib/storage";

export default function OptionEditor({
  question,
  updateQuestion,
}: {
  question: QuizQuestion;
  updateQuestion: (id: string, next: Partial<QuizQuestion>) => void;
}) {
  const options = question.options ?? [];

  async function addOption() {
    const { data, error } = await supabase
      .from("options")
      .insert([{ question_id: question.id, text: "" }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const newOpt: QuizOption = {
      id: data.id,
      text: data.text ?? "",
      imageUrl: data.image_url ?? undefined,
      audioUrl: data.audio_url ?? undefined,
      lang: data.lang as "ar" | "en" | undefined,
    };

    updateQuestion(question.id, { options: [...options, newOpt] });
  }

  async function updateOption(optId: string, next: Partial<QuizOption>) {
    updateQuestion(question.id, {
      options: options.map((o) => (o.id === optId ? { ...o, ...next } : o)),
    });

    const payload: Record<string, unknown> = {};
    if (next.text !== undefined) payload.text = next.text;
    if (next.imageUrl !== undefined) payload.image_url = next.imageUrl;
    if (next.audioUrl !== undefined) payload.audio_url = next.audioUrl;
    if (next.lang !== undefined) payload.lang = next.lang;

    const { error } = await supabase
      .from("options")
      .update(payload)
      .eq("id", optId);
    if (error) console.error("Failed to update option:", error);
  }

  async function removeOption(optId: string) {
    if (!confirm("Are you sure you want to delete this option?")) return;

    const res = await fetch("/api/admin/delete-option", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId: optId }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      alert("Failed to delete option: " + error);
      return;
    }

    // Update local state
    updateQuestion(question.id, {
      options: options.filter((o) => o.id !== optId),
    });
  }

  async function setCorrect(optId: string) {
    // reset all other options
    updateQuestion(question.id, { correctOptionId: optId });

    // update in DB
    const { error } = await supabase.rpc("set_correct_option", {
      question_id: question.id,
      option_id: optId,
    });

    if (error) console.error("Failed to set correct option:", error);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((o) => (
          <div key={o.id} className="p-3 border rounded grid grid-cols-1 gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="radio"
                checked={question.correctOptionId === o.id}
                onChange={() => setCorrect(o.id)}
              />
              <input
                value={o.text ?? ""}
                onChange={(e) => updateOption(o.id, { text: e.target.value })}
                placeholder="Option text (Arabic allowed)"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => removeOption(o.id)}
                className="px-2 py-1 border rounded"
              >
                Delete
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className="block text-sm">Option image</label>
              <input
                className="p-3 border rounded cursor-pointer bg-emerald-300"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const { publicUrl, path } = await uploadFile(
                    "quiz-images",
                    file
                  );

                  updateOption(o.id, { imageUrl: publicUrl });

                  await supabase
                    .from("options")
                    .update({ image_url: publicUrl, image_path: path })
                    .eq("id", o.id);
                }}
              />

              <label className="block text-sm">Option audio</label>
              <input
                className="p-3 border rounded cursor-pointer bg-amber-300"
                type="file"
                accept="audio/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const { publicUrl, path } = await uploadFile(
                    "quiz-audio",
                    file
                  );

                  updateOption(o.id, { audioUrl: publicUrl });

                  await supabase
                    .from("options")
                    .update({ audio_url: publicUrl, audio_path: path })
                    .eq("id", o.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <button onClick={addOption} className="px-3 py-1 border rounded">
          + Add option
        </button>
      </div>
    </div>
  );
}

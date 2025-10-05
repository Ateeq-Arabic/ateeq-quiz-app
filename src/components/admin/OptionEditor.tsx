"use client";

import type { QuizQuestion, QuizOption } from "@/features/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { uploadFile } from "@/lib/storage";
import { useState } from "react";
import Image from "next/image";

export default function OptionEditor({
  question,
  updateQuestion,
}: {
  question: QuizQuestion;
  updateQuestion: (id: string, next: Partial<QuizQuestion>) => void;
}) {
  const options = question.options ?? [];

  const [loadingOps, setLoadingOps] = useState<Record<string, boolean>>({});
  const setLoading = (key: string, v: boolean) =>
    setLoadingOps((s) => ({ ...s, [key]: v }));

  async function addOption() {
    setLoading("add", true);
    try {
      const { data, error } = await supabase
        .from("options")
        .insert([{ question_id: question.id, text: "" }])
        .select()
        .single();

      if (error) throw error;

      const newOpt: QuizOption = {
        id: data.id,
        text: data.text ?? "",
        imageUrl: data.image_url ?? undefined,
        imagePath: data.image_path ?? undefined,
        audioUrl: data.audio_url ?? undefined,
        audioPath: data.audio_path ?? undefined,
        lang: data.lang as "ar" | "en" | undefined,
      };

      updateQuestion(question.id, { options: [...options, newOpt] });
    } catch (err) {
      console.error(err);
      const errorMsg =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert("Failed to add option: " + errorMsg);
    } finally {
      setLoading("add", false);
    }
  }

  async function updateOption(optId: string, next: Partial<QuizOption>) {
    const opt = options.find((o) => o.id === optId);
    const merged = { ...opt, ...next };

    if (!merged.text && !merged.imageUrl && !merged.audioUrl) {
      alert("Option must have at least text, image, or audio.");
      return;
    }

    updateQuestion(question.id, {
      options: options.map((o) => (o.id === optId ? { ...o, ...next } : o)),
    });

    const payload: Record<string, unknown> = {};
    if (next.text !== undefined) payload.text = next.text;
    if (next.imageUrl !== undefined) payload.image_url = next.imageUrl;
    if (next.imagePath !== undefined) payload.image_path = next.imagePath;
    if (next.audioUrl !== undefined) payload.audio_url = next.audioUrl;
    if (next.audioPath !== undefined) payload.audio_path = next.audioPath;
    if (next.lang !== undefined) payload.lang = next.lang;

    const { error } = await supabase
      .from("options")
      .update(payload)
      .eq("id", optId);
    if (error) console.error("Failed to update option:", error);
  }

  async function removeOption(optId: string) {
    if (!confirm("Are you sure you want to delete this option?")) return;

    // Update local state
    updateQuestion(question.id, {
      options: options.filter((o) => o.id !== optId),
    });

    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;

    const res = await fetch("/api/admin/delete-option", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ optionId: optId }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      alert("Failed to delete option: " + error);
      return;
    }
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

  // upload helper — uses existing path for replace
  async function handleUploadForOption(
    optId: string,
    kind: "image" | "audio",
    file: File
  ) {
    const opt = options.find((o) => o.id === optId);
    if (!opt) return;

    const oldPath = kind === "image" ? opt.imagePath : opt.audioPath;
    const bucket = kind === "image" ? "quiz-images" : "quiz-audio";

    try {
      setLoading(optId + ":" + kind, true);

      // Upload new file and tell uploadFile the oldPath so it can remove it
      const { publicUrl, path } = await uploadFile(bucket, file, oldPath);

      // Update DB + UI (we call updateOption so it updates DB and local state)
      if (kind === "image") {
        await updateOption(optId, { imageUrl: publicUrl, imagePath: path });
      } else {
        await updateOption(optId, { audioUrl: publicUrl, audioPath: path });
      }
    } catch (err) {
      console.error("File upload failed:", err);
      alert(
        "Upload failed: " +
          (typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : String(err))
      );
    } finally {
      setLoading(optId + ":" + kind, false);
    }
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
              {/* IMAGE preview + replace */}
              <div>
                <label className="block text-sm">Option image</label>
                {o.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <Image
                      src={o.imageUrl}
                      alt="option image"
                      className="w-24 h-24 object-cover rounded"
                      width={96}
                      height={96}
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await handleUploadForOption(o.id, "image", file);
                        }}
                      />
                      <small className="text-sm text-gray-500">
                        Replace image
                      </small>
                    </div>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleUploadForOption(o.id, "image", file);
                    }}
                  />
                )}
              </div>

              {/* AUDIO preview + replace */}
              <div>
                <label className="block text-sm">Option audio</label>
                {o.audioUrl ? (
                  <div className="flex items-center gap-3">
                    <audio controls src={o.audioUrl} />
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleUploadForOption(o.id, "audio", file);
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleUploadForOption(o.id, "audio", file);
                    }}
                  />
                )}
              </div>
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

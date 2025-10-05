"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/features/quiz/types";
import OptionEditor from "./OptionEditor";
import { uploadFile } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

/**
 * Props:
 * - question: the question object (editable)
 * - updateQuestion: (id, partial) => void
 */
export default function QuestionEditor({
  question,
  updateQuestion,
}: {
  question: QuizQuestion;
  updateQuestion: (id: string, next: Partial<QuizQuestion>) => void;
}) {
  const [tempText, setTempText] = useState(question.promptText ?? "");

  function onSavePrompt() {
    updateQuestion(question.id, { promptText: tempText });
    supabase
      .from("questions")
      .update({ prompt_text: tempText })
      .eq("id", question.id);
  }

  async function uploadPromptFile(kind: "audio" | "image", file: File) {
    const bucket = kind === "audio" ? "quiz-audio" : "quiz-images";
    const oldPath =
      kind === "audio" ? question.promptAudioPath : question.promptImagePath;

    const { publicUrl, path } = await uploadFile(bucket, file, oldPath);

    // update local state (used by UI)
    if (kind === "audio") {
      updateQuestion(question.id, {
        promptAudio: publicUrl,
        promptAudioPath: path,
      });

      await supabase
        .from("questions")
        .update({ prompt_audio: publicUrl, prompt_audio_path: path })
        .eq("id", question.id);
    } else {
      updateQuestion(question.id, {
        promptImage: publicUrl,
        promptImagePath: path,
      });

      await supabase
        .from("questions")
        .update({ prompt_image: publicUrl, prompt_image_path: path })
        .eq("id", question.id);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Prompt (text)</label>
        <textarea
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={onSavePrompt}
            className="px-3 py-1 bg-[var(--primary)] text-white rounded"
          >
            Save Prompt
          </button>
        </div>
      </div>

      {/* audio/image uploads */}
      <div className="grid grid-cols-1 gap-3">
        {/* Prompt audio */}
        <div>
          <label className="block text-sm">Prompt audio</label>
          {question.promptAudio ? (
            <div className="flex items-center gap-3">
              <audio controls src={question.promptAudio} />
              <input
                type="file"
                accept="audio/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await uploadPromptFile("audio", file);
                }}
              />
            </div>
          ) : (
            <input
              className="p-3 border rounded cursor-pointer bg-amber-300"
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await uploadPromptFile("audio", file);
              }}
            />
          )}
        </div>

        {/* Prompt image */}
        <div>
          <label className="block text-sm">Prompt image</label>
          {question.promptImage ? (
            <div className="flex items-center gap-3">
              <Image
                src={question.promptImage}
                alt="Prompt"
                className="w-32 h-32 object-cover rounded"
                width={96}
                height={96}
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await uploadPromptFile("image", file);
                }}
              />
            </div>
          ) : (
            <input
              className="p-3 border rounded cursor-pointer bg-emerald-300"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await uploadPromptFile("image", file);
              }}
            />
          )}
        </div>
      </div>

      {/* type-specific editors */}
      {(question.qType ?? "mcq") === "mcq" && (
        <div>
          <h4 className="font-medium mb-2">Options</h4>
          <OptionEditor question={question} updateQuestion={updateQuestion} />
        </div>
      )}

      {(question.qType ?? "mcq") === "true_false" && (
        <div>
          <label className="block text-sm">Expected answer</label>
          <select
            value={question.expectedAnswer ?? "true"}
            onChange={async (e) => {
              const val = e.target.value;
              updateQuestion(question.id, { expectedAnswer: val });
              await supabase
                .from("questions")
                .update({ expected_answer: val })
                .eq("id", question.id);
            }}
            className="p-2 border rounded"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      )}

      {(question.qType ?? "mcq") === "fill_blank" && (
        <div>
          <label
            htmlFor={`fill-${question.id + "edit"}`}
            className="block text-sm"
          >
            Expected answer (exact, diacritics kept)
          </label>
          <input
            id={`fill-${question.id + "edit"}`}
            type="text"
            lang="ar"
            dir="rtl"
            value={question.expectedAnswer ?? ""}
            onChange={(e) =>
              updateQuestion(question.id, { expectedAnswer: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/features/quiz/types";
import OptionEditor from "./OptionEditor";
import { uploadFile } from "@/lib/storage";

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

      {/* audio/image url fields */}
      <div className="grid grid-cols-1 gap-3">
        <label className="block text-sm">Prompt audio</label>
        <input
          className="p-3 border rounded cursor-pointer bg-amber-300"
          type="file"
          accept="audio/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = await uploadFile("quiz-audio", file);
            updateQuestion(question.id, { promptAudio: url });
          }}
        />

        <label className="block text-sm">Prompt image</label>
        <input
          className="p-3 border rounded cursor-pointer bg-emerald-300"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = await uploadFile("quiz-images", file);
            updateQuestion(question.id, { promptImage: url });
          }}
        />
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
            onChange={(e) =>
              updateQuestion(question.id, { expectedAnswer: e.target.value })
            }
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

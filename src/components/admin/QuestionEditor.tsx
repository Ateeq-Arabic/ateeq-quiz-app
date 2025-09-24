"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/features/quiz/types";
import OptionEditor from "./OptionEditor";

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
        <label className="block text-sm">Prompt audio URL</label>
        <input
          value={question.promptAudio ?? ""}
          onChange={(e) =>
            updateQuestion(question.id, { promptAudio: e.target.value })
          }
          className="w-full p-2 border rounded"
          placeholder="/audio/example.mp3 or https://..."
        />
        <label className="block text-sm">Prompt image URL</label>
        <input
          value={question.promptImage ?? ""}
          onChange={(e) =>
            updateQuestion(question.id, { promptImage: e.target.value })
          }
          className="w-full p-2 border rounded"
          placeholder="/images/example.png or https://..."
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
          <label className="block text-sm">
            Expected answer (exact, diacritics kept)
          </label>
          <input
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

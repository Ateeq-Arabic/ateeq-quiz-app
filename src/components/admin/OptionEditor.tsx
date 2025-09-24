"use client";

// import { useState } from "react";
import type { QuizQuestion, QuizOption } from "@/features/quiz/types";

export default function OptionEditor({
  question,
  updateQuestion,
}: {
  question: QuizQuestion;
  updateQuestion: (id: string, next: Partial<QuizQuestion>) => void;
}) {
  const options = question.options ?? [];

  function addOption() {
    const newOpt: QuizOption = { id: `o_${Date.now()}`, text: "" };
    updateQuestion(question.id, { options: [...options, newOpt] });
  }

  function updateOption(optId: string, next: Partial<QuizOption>) {
    updateQuestion(question.id, {
      options: options.map((o) => (o.id === optId ? { ...o, ...next } : o)),
    });
  }

  function removeOption(optId: string) {
    updateQuestion(question.id, {
      options: options.filter((o) => o.id !== optId),
    });
  }

  function setCorrect(optId: string) {
    updateQuestion(question.id, { correctOptionId: optId });
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
              <input
                value={o.imageUrl ?? ""}
                onChange={(e) =>
                  updateOption(o.id, { imageUrl: e.target.value })
                }
                placeholder="Image URL (optional)"
                className="p-2 border rounded"
              />
              <input
                value={o.audioUrl ?? ""}
                onChange={(e) =>
                  updateOption(o.id, { audioUrl: e.target.value })
                }
                placeholder="Audio URL (optional)"
                className="p-2 border rounded"
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

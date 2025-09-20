// src/components/QuizPlayer.tsx
"use client";

import { useEffect } from "react";
import type { Quiz } from "@/features/quiz/types";
import MCQQuestion from "@/components/questions/MCQQuestion";
import TrueFalseQuestion from "@/components/questions/TrueFalseQuestion";
import FillBlankQuestion from "@/components/questions/FillBlankQuestion";
import { useQuizStore } from "@/store/quizStore";
import { getGroupColor } from "@/features/quiz/colors";

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const reset = useQuizStore((s) => s.reset);
  const finishQuiz = useQuizStore((s) => s.finishQuiz);
  const finished = useQuizStore((s) => s.finished);
  const result = useQuizStore((s) => s.result);

  useEffect(() => {
    // reset when quiz changes
    reset();
  }, [quiz.id, reset]);

  const headerColor = getGroupColor(quiz.group || "default");

  return (
    <div>
      {/* Score display (after finish) */}
      {finished && result && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--accent)]/10 border border-[var(--border)]">
          <h3 className="text-lg font-semibold">
            Score: {result.score} / {result.total}
          </h3>
        </div>
      )}

      {/* Questions list (client side) */}
      <div className="space-y-8">
        {quiz.questions.map((q, idx) => {
          const qType = (q.qType ?? quiz.type) as string;

          return (
            <article
              key={q.id}
              className="rounded-xl overflow-hidden border border-[var(--border)] shadow-sm bg-white"
            >
              {/* Question Header */}
              <div
                className={`${headerColor} text-white px-4 py-2 font-semibold flex items-center text-xl`}
              >
                Question {idx + 1}
              </div>

              {/* Body: delegate to the question components (they are client too) */}
              {qType === "mcq" && <MCQQuestion question={q} />}
              {qType === "true_false" && <TrueFalseQuestion question={q} />}
              {qType === "fill_blank" && <FillBlankQuestion question={q} />}
            </article>
          );
        })}
      </div>

      {/* Finish button */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => finishQuiz(quiz)}
          disabled={finished}
          className="px-5 py-2 rounded-lg bg-[var(--primary)] cursor-pointer text-white disabled:opacity-50"
        >
          Finish
        </button>

        {/* Reset button for development/testing */}
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg border cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

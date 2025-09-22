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
        <div className="mb-6 p-4 h-20 rounded-lg bg-[var(--score)] border border-[var(--border)] flex justify-center items-center">
          <h3 className="text-white text-2xl font-semibold">
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
          onClick={() => {
            finishQuiz(quiz);
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 50);
          }}
          disabled={finished}
          className="px-8 py-2 text-lg rounded-lg bg-[var(--primary)] cursor-pointer text-white disabled:opacity-50 border border-[var(--primary)] hover:bg-white hover:text-[var(--primary)] hover:border hover:border-[var(--primary)] transition"
        >
          Finish
        </button>

        {/* Reset button for development/testing */}
        <button
          type="button"
          onClick={() => {
            reset();
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 50);
          }}
          className="px-4 py-2 text-lg rounded-lg border cursor-pointer hover:bg-[var(--primary)] hover:text-[white] transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

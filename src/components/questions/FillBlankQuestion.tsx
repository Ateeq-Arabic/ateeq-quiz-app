"use client";

import type { QuizQuestion } from "@/features/quiz/types";
import QuestionLayout from "./QuestionLayout";
import { useQuizStore } from "@/store/quizStore";

export default function FillBlankQuestion({
  question,
}: {
  question: QuizQuestion;
}) {
  const value = useQuizStore((s) => s.answers[question.id] || "");
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const finished = useQuizStore((s) => s.finished);
  const result = useQuizStore((s) => s.result);

  const detail = result?.details.find((d) => d.questionId === question.id);

  return (
    <QuestionLayout question={question}>
      <div className="flex justify-center">
        <input
          id={`fill-${question.id}`}
          type="text"
          lang="ar"
          dir="rtl"
          value={value}
          onChange={(e) => setAnswer(question.id, e.target.value)}
          disabled={finished}
          placeholder="Type your answer here"
          className="w-full max-w-md px-4 py-2 h-17 text-xl border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Feedback after finish */}
      {finished && detail && (
        <p className="mt-4 text-center text-lg">
          Correct Answer:{" "}
          <span lang="ar" className="font-bold text-green-600">
            {detail.correctAnswer}
          </span>
          {" · "}
          Your Answer:{" "}
          <span
            lang="ar"
            className={`font-bold ${
              detail.isCorrect ? "text-green-600" : "text-red-600"
            }`}
          >
            {detail.userAnswer ?? "—"}
          </span>
        </p>
      )}
    </QuestionLayout>
  );
}

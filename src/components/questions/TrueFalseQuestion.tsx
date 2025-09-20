"use client";

import type { QuizQuestion } from "@/features/quiz/types";
import QuestionLayout from "./QuestionLayout";
import { useQuizStore } from "@/store/quizStore";

export default function TrueFalseQuestion({
  question,
}: {
  question: QuizQuestion;
}) {
  const selected = useQuizStore((s) => s.answers[question.id]);
  const setAnswer = useQuizStore((s) => s.setAnswer);

  return (
    <QuestionLayout question={question}>
      <div className="flex justify-center gap-6">
        <button
          onClick={() => setAnswer(question.id, "true")}
          className={`px-6 py-3 rounded-lg border font-bold transition cursor-pointer ${
            selected === "true"
              ? "bg-gray-200 cursor-default"
              : "hover:bg-green-100"
          }`}
        >
          ✅ True
        </button>
        <button
          onClick={() => setAnswer(question.id, "false")}
          className={`px-6 py-3 rounded-lg border font-bold transition cursor-pointer ${
            selected === "false"
              ? "bg-gray-200 cursor-default"
              : "hover:bg-red-100"
          }`}
        >
          ❌ False
        </button>
      </div>
    </QuestionLayout>
  );
}

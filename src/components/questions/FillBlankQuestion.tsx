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

  return (
    <QuestionLayout question={question}>
      <div className="flex justify-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setAnswer(question.id, e.target.value)}
          placeholder="Type your answer..."
          className="w-full max-w-md px-4 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
    </QuestionLayout>
  );
}

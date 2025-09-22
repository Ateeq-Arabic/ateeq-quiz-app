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
  const finished = useQuizStore((s) => s.finished);
  const result = useQuizStore((s) => s.result);

  const detail = result?.details.find((d) => d.questionId === question.id);

  return (
    <QuestionLayout question={question}>
      <div className="flex justify-center gap-6">
        {["true", "false"].map((val) => {
          const isSelected = selected === val;
          const isCorrect = detail?.correctAnswer === val;
          const isUserChoice = detail?.userAnswer === val;

          let classes =
            "px-6 py-3 rounded-lg border font-bold transition cursor-pointer ";
          if (!finished) {
            classes += isSelected
              ? "bg-[var(--accent)]/30 cursor-default"
              : "hover:bg-[var(--accent)]/15 cursor-default";
          } else {
            if (isCorrect) classes += "bg-green-200";
            else if (isUserChoice) classes += "bg-red-200";
          }

          return (
            <button
              key={val}
              onClick={() => !finished && setAnswer(question.id, val)}
              className={classes}
              disabled={finished}
            >
              {val === "true" ? "✅ True" : "❌ False"}
            </button>
          );
        })}
      </div>

      {/* Feedback after finish */}
      {finished && detail && (
        <p className="mt-4 text-center text-sm">
          Correct Answer:{" "}
          <span className="font-bold text-green-600">
            {detail.correctAnswer}
          </span>
          {" · "}
          Your Answer:{" "}
          <span
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

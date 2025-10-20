"use client";

import type { QuizQuestion } from "@/features/quiz/types";
import QuestionLayout from "./QuestionLayout";
import { useQuizStore } from "@/store/quizStore";
import { useMemo } from "react";

const isArabicText = (s: string) => /\p{Script=Arabic}/u.test(s);

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

  // Detect language from current input (fallback to expected answer when empty)
  const inputIsArabic = useMemo(() => {
    if (value && typeof value === "string") return isArabicText(value);
    if (question.expectedAnswer) return isArabicText(question.expectedAnswer);
    return false;
  }, [value, question.expectedAnswer]);

  const inputDir = inputIsArabic ? "rtl" : "ltr";
  const inputLang = inputIsArabic ? "ar" : "en";
  const inputFontCls = inputIsArabic ? "font-arabic" : "font-english";

  // For feedback spans
  const correctIsArabic = isArabicText(detail?.correctAnswer ?? "");
  const userIsArabic = isArabicText(detail?.userAnswer ?? "");

  const correctLang = correctIsArabic ? "ar" : "en";
  const correctDir = correctIsArabic ? "rtl" : "ltr";
  const correctFont = correctIsArabic ? "font-arabic" : "font-english";

  const userLang = userIsArabic ? "ar" : "en";
  const userDir = userIsArabic ? "rtl" : "ltr";
  const userFont = userIsArabic ? "font-arabic" : "font-english";

  return (
    <QuestionLayout question={question}>
      <div className="flex justify-center">
        <input
          id={`fill-${question.id}`}
          type="text"
          lang={inputLang}
          dir={inputDir}
          value={value}
          onChange={(e) => setAnswer(question.id, e.target.value)}
          disabled={finished}
          placeholder="Type your answer here"
          className={`w-full max-w-md px-4 py-2 h-17 text-xl border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${inputFontCls}`}
        />
      </div>

      {/* Feedback after finish */}
      {finished && detail && (
        <p className="mt-4 text-center text-lg">
          Correct Answer:{" "}
          <span
            lang={correctLang}
            dir={correctDir}
            className={`font-bold text-green-600 ${correctFont}`}
          >
            {detail.correctAnswer}
          </span>
          {" · "}
          Your Answer:{" "}
          <span
            lang={userLang}
            dir={userDir}
            className={`font-bold ${userFont} ${
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

"use client";

import { create } from "zustand";
import type { Quiz } from "@/features/quiz/types";

type QuestionResult = {
  questionId: string;
  qType?: string;
  userAnswer?: string; // option id for MCQ, "true"/"false" for TF, text for fill
  correctAnswer?: string; // option id (MCQ) or expectedAnswer (TF / fill)
  correctAnswerText?: string; // human-readable (option text) for MCQ
  isCorrect: boolean;
};

export type QuizResult = {
  score: number;
  total: number;
  details: QuestionResult[];
};

type QuizState = {
  answers: Record<string, string>;
  finished: boolean;
  result: QuizResult | null;

  setAnswer: (qid: string, answer: string) => void;
  finishQuiz: (quiz: Quiz) => void;
  reset: () => void;
};

// helpers (place near the top of the file)
const isArabicText = (s: string) => /\p{Script=Arabic}/u.test(s);

const normalizeForCompare = (s: string, treatAsArabic: boolean) => {
  if (typeof s !== "string") return "";
  const trimmed = s.trim();
  // Arabic: keep exact characters (diacritics etc.); English: case-insensitive
  return treatAsArabic ? trimmed : trimmed.toLocaleLowerCase();
};

export const useQuizStore = create<QuizState>((set, get) => ({
  answers: {},
  finished: false,
  result: null,

  setAnswer(qid: string, answer: string) {
    set((s) => ({ answers: { ...s.answers, [qid]: answer } }));
  },

  finishQuiz(quiz: Quiz) {
    const answers = get().answers;
    const details: QuestionResult[] = [];

    let score = 0;
    const total = quiz.questions.length;

    for (const q of quiz.questions) {
      const qType = (q.qType ?? quiz.type) || "mcq";
      const userAnswer = answers[q.id];
      let correctAnswer: string | undefined;
      let correctAnswerText: string | undefined;
      let isCorrect = false;

      if (qType === "mcq") {
        correctAnswer = q.correctOptionId;
        correctAnswerText = q.options?.find(
          (o) => o.id === correctAnswer
        )?.text;
        isCorrect = !!userAnswer && userAnswer === correctAnswer;
      } else if (qType === "true_false") {
        correctAnswer = q.expectedAnswer;
        isCorrect =
          !!userAnswer &&
          userAnswer.toLocaleLowerCase() ===
            (q.expectedAnswer ?? "").toLocaleLowerCase();
      } else if (qType === "fill_blank") {
        correctAnswer = q.expectedAnswer ?? "";

        const ua = typeof userAnswer === "string" ? userAnswer : "";
        // decide language based on the expected answer if available; otherwise based on user input
        const treatAsArabic = isArabicText(correctAnswer) || isArabicText(ua);

        // strict comparison (including diacritics);
        // Arabic → strict (trim only); English → case-insensitive (lowercase + trim)
        isCorrect =
          normalizeForCompare(ua, treatAsArabic) ===
          normalizeForCompare(correctAnswer ?? "", treatAsArabic);
      }

      if (isCorrect) score++;

      details.push({
        questionId: q.id,
        qType,
        userAnswer,
        correctAnswer,
        correctAnswerText,
        isCorrect,
      });
    }

    set(() => ({ finished: true, result: { score, total, details } }));
  },

  reset() {
    set(() => ({ answers: {}, finished: false, result: null }));
  },
}));

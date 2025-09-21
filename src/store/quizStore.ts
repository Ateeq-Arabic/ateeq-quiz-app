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
        // strict comparison (including diacritics); trim whitespace on both sides
        isCorrect =
          typeof userAnswer === "string" &&
          userAnswer.trim() === (correctAnswer ?? "").trim();
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

"use client";

import type { QuizQuestion } from "@/features/quiz/types";
import QuestionLayout from "./QuestionLayout";
import OptionItem from "./OptionItem";
import { useQuizStore } from "@/store/quizStore";

export default function MCQQuestion({ question }: { question: QuizQuestion }) {
  const selected = useQuizStore((s) => s.answers[question.id]);
  const setAnswer = useQuizStore((s) => s.setAnswer);

  if (!question.options?.length) return null;

  return (
    <QuestionLayout question={question}>
      <ul className="space-y-4">
        {question.options.map((opt) => (
          <OptionItem
            key={opt.id}
            id={opt.id}
            text={opt.text}
            imageUrl={opt.imageUrl}
            audioUrl={opt.audioUrl}
            selected={selected === opt.id}
            onSelect={() => setAnswer(question.id, opt.id)}
          />
        ))}
      </ul>
    </QuestionLayout>
  );
}

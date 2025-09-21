"use client";

import type { QuizQuestion } from "@/features/quiz/types";
import QuestionLayout from "./QuestionLayout";
import OptionItem from "./OptionItem";

export default function MCQQuestion({ question }: { question: QuizQuestion }) {
  if (!question.options?.length) return null;

  return (
    <QuestionLayout question={question}>
      <ul className="space-y-4">
        {question.options.map((opt) => (
          <OptionItem
            key={opt.id}
            qid={question.id}
            id={opt.id}
            text={opt.text}
            imageUrl={opt.imageUrl}
            audioUrl={opt.audioUrl}
          />
        ))}
      </ul>
    </QuestionLayout>
  );
}

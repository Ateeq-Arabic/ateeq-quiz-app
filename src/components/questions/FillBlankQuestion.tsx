import type { QuizQuestion } from "@/features/quiz/types";
import QuestionLayout from "./QuestionLayout";

export default function FillBlankQuestion({
  question,
}: {
  question: QuizQuestion;
}) {
  return (
    <QuestionLayout question={question}>
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Type your answer..."
          className="w-full max-w-md px-4 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
    </QuestionLayout>
  );
}

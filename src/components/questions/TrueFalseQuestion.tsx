import type { QuizQuestion } from "@/features/quiz/types";
import QuestionLayout from "./QuestionLayout";

export default function TrueFalseQuestion({
  question,
}: {
  question: QuizQuestion;
}) {
  return (
    <QuestionLayout question={question}>
      <div className="flex justify-center gap-6">
        <button className="px-6 py-3 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-green-100 transition font-bold">
          ✅ True
        </button>
        <button className="px-6 py-3 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-red-100 transition font-bold">
          ❌ False
        </button>
      </div>
    </QuestionLayout>
  );
}

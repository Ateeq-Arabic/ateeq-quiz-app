import { quizzes } from "@/features/quiz/quizzes";
import type { Quiz } from "@/features/quiz/types";
import MCQQuestion from "@/components/questions/MCQQuestion";
import TrueFalseQuestion from "@/components/questions/TrueFalseQuestion";
import FillBlankQuestion from "@/components/questions/FillBlankQuestion";
import { getGroupColor } from "@/features/quiz/colors";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quiz: Quiz | undefined = quizzes.find(
    (q) => q.id === id || q.slug === id
  );

  if (!quiz) {
    return (
      <main className="flex items-center justify-center min-h-screen p-8">
        <h1 className="text-2xl font-bold">Quiz not found 😢</h1>
      </main>
    );
  }

  const headerColor = getGroupColor(quiz.group || "Other");

  return (
    <main className="min-h-screen px-4 py-10 bg-[var(--background)]">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8">
        {/* Quiz Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--primary)]">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-sm text-[var(--muted)] mt-2">
              {quiz.description}
            </p>
          )}
        </header>

        {/* Questions */}
        <div className="space-y-8">
          {quiz.questions.map((q, idx) => {
            const qType = (q.qType ?? quiz.type) as string; // prefer question type, fallback to quiz type
            return (
              <article
                key={q.id}
                className="rounded-xl overflow-hidden border border-[var(--border)] shadow-sm bg-white"
              >
                {/* Question Header */}
                <div
                  className={`${headerColor} text-white px-4 py-2 font-semibold flex items-center text-xl`}
                >
                  Question {idx + 1}
                </div>

                {/* Question Body — render according to qType */}
                {qType === "mcq" && <MCQQuestion question={q} />}

                {qType === "true_false" && <TrueFalseQuestion question={q} />}

                {qType === "fill_blank" && <FillBlankQuestion question={q} />}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

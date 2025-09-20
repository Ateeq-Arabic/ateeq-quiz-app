// src/app/quiz/[id]/page.tsx  (server component)
import { quizzes } from "@/features/quiz/quizzes";
import type { Quiz } from "@/features/quiz/types";
import QuizPlayer from "@/components/QuizPlayer";

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

  // header UI (server) — keep this, player is client
  return (
    <main className="min-h-screen px-4 py-10 bg-[var(--background)]">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8">
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

        {/* Client-side player */}
        <QuizPlayer quiz={quiz} />
      </div>
    </main>
  );
}

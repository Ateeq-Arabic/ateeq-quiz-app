// src/app/quiz/[id]/page.tsx
import Image from "next/image";
import { quizzes } from "@/features/quiz/quizzes";
import type { Quiz } from "@/features/quiz/types";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required by Next.js App Router
  const { id } = await params;

  // Find quiz by id or slug (your quizzes.ts uses string ids)
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

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
      {quiz.description && (
        <p className="text-sm text-[var(--muted)] mb-6">{quiz.description}</p>
      )}

      <div className="space-y-6">
        {quiz.questions.map((q) => (
          <article
            key={q.id}
            className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)]"
          >
            {/* question prompt */}
            <h2 className="font-semibold text-lg mb-3">
              {q.promptText ?? "—"}
            </h2>

            {/* MCQ: show options (text / image / audio) */}
            {quiz.type === "mcq" && q.options && q.options.length > 0 && (
              <ul className="space-y-2">
                {q.options.map((opt) => (
                  <li
                    key={opt.id}
                    className="p-3 rounded-lg border border-[var(--border)] cursor-pointer hover:shadow-sm flex items-center gap-3"
                  >
                    {opt.text && (
                      <span className="font-arabic">{opt.text}</span>
                    )}

                    {opt.imageUrl && (
                      <Image
                        src={opt.imageUrl}
                        alt={opt.text ?? ""}
                        width={40}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    )}

                    {opt.audioUrl && <audio src={opt.audioUrl} controls />}
                  </li>
                ))}
              </ul>
            )}

            {/* True/False: show two radio buttons (no text input) */}
            {quiz.type === "true_false" && (
              <div className="space-x-4">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name={q.id} value="true" />
                  <span>True</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name={q.id} value="false" />
                  <span>False</span>
                </label>
              </div>
            )}

            {/* Fill-in-the-blank: simple input (we'll wire strict checking later) */}
            {quiz.type === "fill_blank" && q.expectedAnswer && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Type your answer (include diacritics)"
                  className="border rounded p-2 w-full"
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

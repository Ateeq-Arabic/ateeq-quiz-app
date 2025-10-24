// (server component)
import { supabase } from "@/lib/supabaseClient";
import type {
  Quiz,
  QuizQuestion,
  DBQuestionWithOptions,
} from "@/features/quiz/types";
import QuizPlayer from "@/components/QuizPlayer";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try find by slug first
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      `
      id, slug, title, description, group,
      questions:questions (
        id, q_type, prompt_text, prompt_audio, prompt_image, expected_answer, order_index,
        options:options (
          id, text, image_url, audio_url, lang, is_correct
        )
      )
      `
    )
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (error || !data) {
    return (
      <main className="flex items-center justify-center min-h-screen p-8">
        <h1 className="text-2xl font-bold">Quiz not found 😢</h1>
      </main>
    );
  }

  // Map DB → frontend type
  const quiz: Quiz = {
    id: data.id,
    slug: data.slug ?? undefined,
    title: data.title,
    description: data.description ?? undefined,
    group: data.group ?? undefined,
    questions: (data.questions as DBQuestionWithOptions[])
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map(
        (q): QuizQuestion => ({
          id: q.id,
          qType: q.q_type ?? undefined,
          promptText: q.prompt_text ?? undefined,
          promptAudio: q.prompt_audio ?? undefined,
          promptImage: q.prompt_image ?? undefined,
          expectedAnswer: q.expected_answer ?? undefined,
          orderIndex: q.order_index ?? undefined,
          options: q.options?.map((o) => ({
            id: o.id,
            text: o.text ?? undefined,
            imageUrl: o.image_url ?? undefined,
            audioUrl: o.audio_url ?? undefined,
            lang: o.lang as "ar" | "en" | undefined,
          })),
          correctOptionId: q.options?.find((o) => o.is_correct)?.id,
        })
      ),
  };

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

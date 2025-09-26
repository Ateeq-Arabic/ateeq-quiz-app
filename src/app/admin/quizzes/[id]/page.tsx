"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import QuizForm from "@/components/admin/QuizForm";
import QuestionEditor from "@/components/admin/QuestionEditor";
import type {
  Quiz,
  QuizQuestion,
  QuizType,
  DBQuestion,
  DBQuestionWithOptions,
} from "@/features/quiz/types";
import Link from "next/link";

export default function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // fetch quiz + questions
  useEffect(() => {
    async function fetchQuiz() {
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          `
    id, title, description, group,
    questions:questions (
      id, q_type, prompt_text, prompt_audio, prompt_image, expected_answer,
      options:options (
        id, text, image_url, audio_url, lang, is_correct
      )
    )
    `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        // Map DB fields to our Quiz type
        setQuiz({
          id: data.id,
          title: data.title,
          description: data.description,
          group: data.group,
          questions: (data.questions as DBQuestionWithOptions[]).map(
            (q): QuizQuestion => ({
              id: q.id,
              qType: q.q_type ?? undefined,
              promptText: q.prompt_text ?? undefined,
              promptAudio: q.prompt_audio ?? undefined,
              promptImage: q.prompt_image ?? undefined,
              expectedAnswer: q.expected_answer ?? undefined,
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
        });
      }
      setLoading(false);
    }

    fetchQuiz();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;

  if (!quiz)
    return (
      <main className="p-4">
        <p>Quiz not found</p>
        <Link href="/admin/quizzes" className="text-blue-600 hover:underline">
          Back to list
        </Link>
      </main>
    );

  // update quiz metadata
  async function updateMeta(changes: Partial<Quiz>) {
    setQuiz((q) => ({ ...q!, ...changes }));
    const { error } = await supabase
      .from("quizzes")
      .update(changes)
      .eq("id", quiz?.id);

    if (error) console.error("Failed to update quiz:", error);
  }

  // add new question
  async function addQuestion(qType: QuizType) {
    const { data, error } = await supabase
      .from("questions")
      .insert([{ quiz_id: quiz?.id, q_type: qType }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setQuiz((s) => ({
      ...s!,
      questions: [
        ...s!.questions,
        {
          id: data.id,
          qType: data.q_type,
          promptText: data.prompt_text,
          promptAudio: data.prompt_audio,
          promptImage: data.prompt_image,
          expectedAnswer: data.expected_answer,
          options: [],
        },
      ],
    }));
  }

  // update existing question
  async function updateQuestion(qId: string, next: Partial<QuizQuestion>) {
    setQuiz((s) => ({
      ...s!,
      questions: s!.questions.map((qq) =>
        qq.id === qId ? { ...qq, ...next } : qq
      ),
    }));

    const payload: Partial<DBQuestion> = {};
    if (next.promptText !== undefined) payload.prompt_text = next.promptText;
    if (next.promptAudio !== undefined) payload.prompt_audio = next.promptAudio;
    if (next.promptImage !== undefined) payload.prompt_image = next.promptImage;
    if (next.expectedAnswer !== undefined)
      payload.expected_answer = next.expectedAnswer;
    if (next.qType !== undefined) payload.q_type = next.qType;

    const { error } = await supabase
      .from("questions")
      .update(payload)
      .eq("id", qId);

    if (error) console.error("Failed to update question:", error);
  }

  // remove question
  async function removeQuestion(qId: string) {
    setQuiz((s) => ({
      ...s!,
      questions: s!.questions.filter((qq) => qq.id !== qId),
    }));

    const { error } = await supabase.from("questions").delete().eq("id", qId);
    if (error) console.error("Failed to delete question:", error);
  }

  return (
    <main className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Edit Quiz</h2>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/quizzes")}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        </div>
      </div>

      {/* Quiz metadata form */}
      <QuizForm quiz={quiz} updateMeta={updateMeta} groupList={[]} />

      {/* Questions section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Questions</h3>
          <div className="flex gap-2">
            <button
              onClick={() => addQuestion("mcq")}
              className="px-3 py-1 rounded bg-[var(--accent)]/20"
            >
              + MCQ
            </button>
            <button
              onClick={() => addQuestion("true_false")}
              className="px-3 py-1 rounded bg-[var(--accent)]/20"
            >
              + T/F
            </button>
            <button
              onClick={() => addQuestion("fill_blank")}
              className="px-3 py-1 rounded bg-[var(--accent)]/20"
            >
              + Fill
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--background)]">
                <div>
                  <strong>Q {idx + 1}</strong> —{" "}
                  <span className="text-sm text-[var(--muted)]">
                    {q.qType ?? "mcq"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="px-2 py-1 border rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-4">
                <QuestionEditor question={q} updateQuestion={updateQuestion} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

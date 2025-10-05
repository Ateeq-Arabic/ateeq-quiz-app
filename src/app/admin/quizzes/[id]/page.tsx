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
  const [groups, setGroups] = useState<string[]>([]);

  // fetch quiz + questions
  useEffect(() => {
    async function fetchQuiz() {
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          `
    id, title, description, group, slug,
    questions:questions (
      id, q_type, prompt_text, prompt_audio, prompt_image,
      prompt_audio_path, prompt_image_path, expected_answer,
      options:options (
        id, text, image_url, audio_url,
        image_path, audio_path, lang, is_correct
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
          slug: data.slug ?? undefined,
          questions: (data.questions as DBQuestionWithOptions[]).map(
            (q): QuizQuestion => ({
              id: q.id,
              qType: q.q_type ?? undefined,
              promptText: q.prompt_text ?? undefined,
              promptAudio: q.prompt_audio ?? undefined,
              promptAudioPath: q.prompt_audio_path ?? undefined,
              promptImage: q.prompt_image ?? undefined,
              promptImagePath: q.prompt_image_path ?? undefined,
              expectedAnswer: q.expected_answer ?? undefined,
              options: q.options?.map((o) => ({
                id: o.id,
                text: o.text ?? undefined,
                imageUrl: o.image_url ?? undefined,
                imagePath: o.image_path ?? undefined,
                audioUrl: o.audio_url ?? undefined,
                audioPath: o.audio_path ?? undefined,
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

  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase
        .from("quizzes")
        .select("group")
        .not("group", "is", null);

      if (!error && data) {
        const uniqueGroups = Array.from(new Set(data.map((d) => d.group)));
        setGroups(uniqueGroups as string[]);
      }
    }

    fetchGroups();
  }, []);

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

  function validateQuestion(q: QuizQuestion): string | null {
    // must have some content
    if (!q.promptText && !q.promptImage && !q.promptAudio) {
      return "Question must have text, image, or audio.";
    }

    // for MCQ: must have at least 2 options and each option must have content
    if (q.qType === "mcq") {
      if (!q.options || q.options.length < 2) {
        return "MCQ must have at least 2 options.";
      }

      for (const opt of q.options) {
        if (!opt.text && !opt.imageUrl && !opt.audioUrl) {
          return "Each option must have text, image, or audio.";
        }
      }
    }

    return null;
  }

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

    const newQuestion: QuizQuestion = {
      id: data.id,
      qType: data.q_type,
      promptText: data.prompt_text,
      promptAudio: data.prompt_audio,
      promptImage: data.prompt_image,
      expectedAnswer: data.expected_answer,
      options: [],
    };

    // if T/F and no expected answer, set to "true"
    if (qType === "true_false" && !data.expected_answer) {
      newQuestion.expectedAnswer = "true";
      await supabase
        .from("questions")
        .update({ expected_answer: "true" })
        .eq("id", data.id);
    }

    setQuiz((s) => ({
      ...s!,
      questions: [...s!.questions, newQuestion],
    }));
  }

  // update existing question
  async function updateQuestion(qId: string, next: Partial<QuizQuestion>) {
    const currentQ = quiz!.questions.find((qq) => qq.id === qId)!;
    const updatedQ: QuizQuestion = { ...currentQ, ...next };

    // validate before saving
    const error = validateQuestion(updatedQ);
    if (error) {
      alert(error);
      return;
    }

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

    const { error: dbError } = await supabase
      .from("questions")
      .update(payload)
      .eq("id", qId);

    if (dbError) console.error("Failed to update question:", error);
  }

  // remove question
  async function removeQuestion(qId: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;

    const res = await fetch("/api/admin/delete-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questionId: qId }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      alert("Failed to delete question: " + error);
      return;
    }

    // update UI state after success
    setQuiz((s) => ({
      ...s!,
      questions: s!.questions.filter((qq) => qq.id !== qId),
    }));
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
      <QuizForm quiz={quiz} updateMeta={updateMeta} groupList={groups} />

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

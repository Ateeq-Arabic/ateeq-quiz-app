"use client";

import { use } from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { quizzes } from "@/features/quiz/quizzes";
import QuizForm from "@/components/admin/QuizForm";
import QuestionEditor from "@/components/admin/QuestionEditor";
import type { Quiz, QuizQuestion, QuizType } from "@/features/quiz/types";
import Link from "next/link";

export default function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  // Always resolve the quiz here
  const original = quizzes.find((q) => q.id === id) as Quiz | undefined;

  // Hooks must always be called (so no early return above!)
  const [quiz, setQuiz] = useState<Quiz | null>(
    original ? structuredClone(original) : null
  );

  const groupList = useMemo(() => {
    const groups = new Set<string>();
    quizzes.forEach((q) => q.group && groups.add(q.group));
    return Array.from(groups);
  }, []);

  // If quiz not found → render fallback AFTER hooks
  if (!quiz) {
    return (
      <main className="p-4">
        <p>Quiz not found</p>
        <Link href="/admin/quizzes" className="text-blue-600 hover:underline">
          Back to list
        </Link>
      </main>
    );
  }

  // helpers
  function updateMeta(changes: Partial<Quiz>) {
    setQuiz((q) => ({ ...q!, ...changes }));
  }

  function addQuestion(qType: QuizType) {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      qType,
      promptText: qType === "true_false" ? "True or False?" : "",
      promptParts: undefined,
      promptAudio: undefined,
      promptImage: undefined,
      options: qType === "mcq" ? [{ id: "o1", text: "" }] : undefined,
    };
    setQuiz((s) => ({ ...s!, questions: [...s!.questions, newQ] }));
  }

  function updateQuestion(qId: string, next: Partial<QuizQuestion>) {
    setQuiz((s) => ({
      ...s!,
      questions: s!.questions.map((qq) =>
        qq.id === qId ? { ...qq, ...next } : qq
      ),
    }));
  }

  function removeQuestion(qId: string) {
    setQuiz((s) => ({
      ...s!,
      questions: s!.questions.filter((qq) => qq.id !== qId),
    }));
  }

  function onSave() {
    // Dummy save
    router.push("/admin/quizzes");
  }

  return (
    <main className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Edit Quiz</h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded"
          >
            Save
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Quiz metadata form */}
      <QuizForm quiz={quiz} updateMeta={updateMeta} groupList={groupList} />

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

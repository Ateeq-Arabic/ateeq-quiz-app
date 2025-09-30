"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type QuizRow = {
  id: string;
  title: string;
  group: string | null;
  questions: { id: string }[];
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch quizzes on mount
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, group, questions:questions(id)");

      if (error) {
        console.error("Error fetching quizzes:", error);
      } else {
        setQuizzes((data as QuizRow[]) ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(quizId: string) {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;

    const res = await fetch("/api/admin/delete-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quizId }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      alert("Failed to delete quiz: " + error);
      return;
    }

    // update state to remove deleted quiz
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  }

  if (loading) {
    return <main className="p-4">Loading quizzes...</main>;
  }

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Quizzes</h2>
        <Link
          href="/admin/quizzes/new"
          className="px-4 py-2 rounded bg-[var(--primary)] text-white hover:opacity-90"
        >
          + New Quiz
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="text-left p-3 border">Title</th>
              <th className="text-left p-3 border">Group</th>
              <th className="text-left p-3 border">Questions</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes?.map((q) => (
              <tr key={q.id} className="odd:bg-white even:bg-[var(--accent)]/5">
                <td className="p-3 border">{q.title}</td>
                <td className="p-3 border">{q.group ?? "—"}</td>
                <td className="p-3 border">{q.questions?.length ?? 0}</td>
                <td className="p-3 border">
                  <Link
                    href={`/admin/quizzes/${q.id}`}
                    className="text-[var(--primary)] hover:underline mr-4"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/quiz/${q.id}`}
                    className="text-[var(--muted)] hover:underline"
                  >
                    Preview
                  </Link>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-600 hover:underline cursor-pointer ml-4"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

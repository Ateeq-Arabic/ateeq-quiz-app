import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function AdminQuizzesPage() {
  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select("id, title, group, questions:questions(id)");

  if (error) {
    console.log("Error fetching quizzes:", error);
    return (
      <div className="p-4 text-red-600">
        Failed to load quizzes: {error.message}
      </div>
    );
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

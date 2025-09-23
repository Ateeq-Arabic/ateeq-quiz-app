import Link from "next/link";
import { quizzes } from "@/features/quiz/quizzes";

export default function AdminQuizzesPage() {
  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Link
          href="/admin/quizzes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Quiz
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Group</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((q) => (
            <tr key={q.id}>
              <td className="p-2 border">{q.title}</td>
              <td className="p-2 border">{q.group ?? "—"}</td>
              <td className="p-2 border">
                <Link
                  href={`/admin/quizzes/${q.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

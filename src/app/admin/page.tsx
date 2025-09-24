import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/quizzes" className="p-4 border rounded hover:shadow">
          <h3 className="font-medium">Manage Quizzes</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Create / edit quizzes and questions
          </p>
        </Link>
      </div>
    </main>
  );
}

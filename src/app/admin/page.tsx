import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <ul className="space-y-4">
        <li>
          <Link href="/admin/quizzes" className="text-blue-600 hover:underline">
            Manage Quizzes
          </Link>
        </li>
      </ul>
    </main>
  );
}

import Link from "next/link";
import "../globals.css";
import AdminGuard from "@/components/admin/AdminGuard";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata = {
  title: "Admin - Quiz",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <nav className="space-x-4">
            <Link
              href="/admin"
              className="text-sm text-[var(--muted)] hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/quizzes"
              className="text-sm text-[var(--muted)] hover:underline"
            >
              Quizzes
            </Link>

            <LogoutButton />
          </nav>
        </header>

        {/* client-side guard ensures only admins see the children */}
        <AdminGuard>{children}</AdminGuard>
      </div>
    </div>
  );
}

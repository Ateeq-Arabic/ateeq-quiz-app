import Link from "next/link";
import type { Quiz } from "@/features/quiz/types";

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      className="block p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--primary)]">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-sm mt-1 text-[var(--muted)]">
              {quiz.description}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]">
            {quiz.type.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>
    </Link>
  );
}

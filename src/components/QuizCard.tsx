import type { Quiz } from "@/features/quiz/types";
import Link from "next/link";

interface QuizCardProps {
  quiz: Quiz;
  headerColor: string;
}

export default function QuizCard({ quiz, headerColor }: QuizCardProps) {
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      className="h-40 rounded-xl overflow-hidden border-2 border-[var(--border)] shadow-sm hover:shadow-md transition bg-white"
    >
      {/* Quiz Title Header */}
      <div
        className={`${headerColor} px-4 py-2 text-white font-bold text-center`}
      >
        {quiz.title}
      </div>

      {/* Quiz Description */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-[var(--muted)]">{quiz.description}</p>
        <span className="inline-block text-xs px-2 py-1 rounded bg-[var(--accent)]/20 text-[var(--primary)] font-medium">
          {quiz.slug}
        </span>
      </div>
    </Link>
  );
}

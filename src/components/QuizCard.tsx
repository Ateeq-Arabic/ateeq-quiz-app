import type { Quiz } from "@/features/quiz/types";
import Link from "next/link";

// A small helper to make type labels language-aware
function getTypeLabel(type: Quiz["type"]): string {
  switch (type) {
    case "mcq":
      return "Multiple Choice";
    case "true_false":
      return "True / False";
    case "fill_blank":
      return "Fill in the Blank";
    default:
      return type || "Other";
  }
}

interface QuizCardProps {
  quiz: Quiz;
  headerColor: string;
}

export default function QuizCard({ quiz, headerColor }: QuizCardProps) {
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      className="rounded-xl overflow-hidden border-2 border-[var(--border)] shadow-sm hover:shadow-md transition bg-white"
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
          {getTypeLabel(quiz.type)}
        </span>
      </div>
    </Link>
  );
}

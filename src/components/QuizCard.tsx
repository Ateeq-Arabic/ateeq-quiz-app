import type { Quiz } from "@/features/quiz/types";
import Link from "next/link";

interface QuizCardProps {
  quiz: Quiz;
  headerColor: string;
}

export default function QuizCard({ quiz, headerColor }: QuizCardProps) {
  return (
    <Link
      href={`/quiz/${quiz.slug ?? quiz.id}`}
      className="block rounded-xl overflow-hidden border-2 border-[var(--border)] shadow-sm hover:shadow-md transition bg-white"
    >
      <div className="flex flex-col">
        {/* Quiz Title Header */}
        <div
          className={`${headerColor} px-4 py-2 text-white font-bold text-center`}
        >
          {quiz.title}
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Clamp the description so it never pushes slug away */}
          <p className="text-sm text-[var(--muted)] whitespace-pre-line break-words">
            {quiz.description}
          </p>
          {/* Keep the slug visible at the bottom */}
          <span className="mt-3 self-start inline-block text-xs px-2 py-1 rounded bg-[var(--accent)]/20 text-[var(--primary)] font-medium">
            {quiz.slug}
          </span>
        </div>
      </div>
    </Link>
  );
}

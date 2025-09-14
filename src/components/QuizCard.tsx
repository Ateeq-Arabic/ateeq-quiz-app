import type { Quiz } from "@/features/quiz/types";
import Link from "next/link";

export default function QuizCard({
  quiz,
  headerColor,
}: {
  quiz: Quiz;
  headerColor: string;
}) {
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      className="rounded-xl overflow-hidden border-[2px] border-[var(--border)] shadow-sm hover:shadow-md transition bg-white"
    >
      {/* Quiz Title Header */}
      <div className={`${headerColor} px-4 py-2 text-white font-bold`}>
        {quiz.title}
      </div>

      {/* Quiz Description */}
      <div className="p-4 space-y-2">
        <p className="text-sm text-[var(--muted)]">{quiz.description}</p>
        <span className="inline-block text-xs px-2 py-1 rounded bg-[var(--accent)]/20 text-[var(--primary)]">
          {quiz.type.replace("_", " ")}
        </span>
      </div>
    </Link>
  );
}

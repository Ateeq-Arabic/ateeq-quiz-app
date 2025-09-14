import type { Quiz } from "@/features/quiz/types";
import QuizCard from "./QuizCard";

export default function QuizGroup({
  groupName,
  items,
  headerColor,
}: {
  groupName: string;
  items: Quiz[];
  headerColor: string;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-4 flex items-center">
        {groupName}
        <span className="flex-grow ml-4 border-t border-[var(--muted)]"></span>
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} headerColor={headerColor} />
        ))}
      </div>
    </section>
  );
}

import type { Quiz } from "@/features/quiz/types";
import QuizCard from "./QuizCard";

export default function QuizGroup({
  groupName,
  items,
}: {
  groupName: string;
  items: Quiz[];
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-[var(--primary)]">
        {groupName}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((q) => (
          <QuizCard key={q.id} quiz={q} />
        ))}
      </div>
    </section>
  );
}

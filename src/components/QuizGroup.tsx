import type { Quiz } from "@/features/quiz/types";
import QuizCard from "./QuizCard";

interface QuizGroupProps {
  groupName: string;
  items: Quiz[];
  headerColor: string;
}

export default function QuizGroup({
  groupName,
  items,
  headerColor,
}: QuizGroupProps) {
  return (
    <section className="mb-12">
      {/* Group Header with background color */}
      <div className={`${headerColor} rounded-lg px-4 py-2 mb-6`}>
        <h2 className="text-lg font-semibold text-white">{groupName}</h2>
      </div>

      {/* Quiz Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} headerColor={headerColor} />
        ))}
      </div>
    </section>
  );
}

import { quizzes } from "@/features/quiz/quizzes";
import QuizGroup from "@/components/QuizGroup";

const ORDER: Array<[string, string]> = [
  ["mcq", "Multiple Choice (MCQ)"],
  ["true_false", "True / False"],
  ["fill_blank", "Fill in the Blank"],
];

const COLORS = {
  mcq: "bg-[var(--card-header1)]",
  true_false: "bg-[var(--card-header2)]",
  fill_blank: "bg-[var(--card-header3)]",
};

function groupByType(list: typeof quizzes) {
  const map = new Map<string, typeof quizzes>();
  for (const q of list) {
    const arr = map.get(q.type) ?? [];
    arr.push(q);
    map.set(q.type, arr);
  }
  return map;
}

export default function Home() {
  const grouped = groupByType(quizzes);
  return (
    <main className="min-h-screen px-4 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-md p-6">
        {/* Page Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary)]">Quizzes</h1>
          <p className="text-base text-[var(--muted)] mt-2">
            Choose a quiz to test your Arabic basics.
          </p>
        </header>

        {/* Quiz Groups */}
        <div>
          {ORDER.map(([typeKey, label]) => {
            const items = grouped.get(typeKey) ?? [];
            if (items.length === 0) return null;
            return (
              <QuizGroup
                key={typeKey}
                groupName={label}
                items={items}
                headerColor={COLORS[typeKey as keyof typeof COLORS]}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

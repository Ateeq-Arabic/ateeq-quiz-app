import { quizzes } from "@/features/quiz/quizzes";
import QuizGroup from "@/components/QuizGroup";

const ORDER: Array<[string, string]> = [
  ["mcq", "Multiple Choice (MCQ)"],
  ["true_false", "True / False"],
  ["fill_blank", "Fill in the Blank"],
];

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
    <main className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--primary)]">Quizzes</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Choose a quiz to test your Arabic basics. (Click to open.)
        </p>
      </header>

      <div>
        {ORDER.map(([typeKey, label]) => {
          const items = grouped.get(typeKey) ?? [];
          if (items.length === 0) return null;
          return <QuizGroup key={typeKey} groupName={label} items={items} />;
        })}
      </div>
    </main>
  );
}

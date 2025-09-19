import { quizzes } from "@/features/quiz/quizzes";
import QuizGroup from "@/components/QuizGroup";
import { getGroupColor } from "@/features/quiz/colors";

// Group quizzes by their "group" attribute
function groupByGroup(list: typeof quizzes) {
  const map = new Map<string, typeof quizzes>();
  for (const q of list) {
    const key = q.group ?? "Other";
    const arr = map.get(key) ?? [];
    arr.push(q);
    map.set(key, arr);
  }
  return map;
}

export default function Home() {
  const grouped = groupByGroup(quizzes);

  // Convert map to array so we can assign colors consistently
  const groupEntries = Array.from(grouped.entries());

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
          {groupEntries.map(([groupName, items]) => {
            const headerColor = getGroupColor(groupName);
            return (
              <QuizGroup
                key={groupName}
                groupName={groupName}
                items={items}
                headerColor={headerColor}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

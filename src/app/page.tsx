import { supabase } from "@/lib/supabaseClient";
import QuizGroup from "@/components/QuizGroup";
import { getGroupColor } from "@/features/quiz/colors";
import type { Quiz, DBQuiz } from "@/features/quiz/types";

// Group quizzes by their "group" attribute
function groupByGroup(list: Quiz[]) {
  const map = new Map<string, Quiz[]>();
  for (const q of list) {
    const key = q.group ?? "Other";
    const arr = map.get(key) ?? [];
    arr.push(q);
    map.set(key, arr);
  }
  return map;
}

export default async function Home() {
  // Fetch quizzes (no questions here — just metadata for the list)
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, slug, title, description, group, type")
    .order("group", { ascending: true });

  if (error) {
    console.error("Failed to fetch quizzes:", error.message);
    return (
      <main className="p-6">
        <h1 className="text-red-600">Error loading quizzes</h1>
      </main>
    );
  }

  const quizzes: Quiz[] =
    data?.map((q: DBQuiz) => ({
      id: q.id,
      slug: q.slug ?? undefined,
      title: q.title,
      description: q.description ?? undefined,
      group: q.group ?? undefined,
      questions: [], // not needed on homepage
    })) ?? [];

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

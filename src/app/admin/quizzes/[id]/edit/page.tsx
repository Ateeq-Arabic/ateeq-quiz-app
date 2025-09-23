import { quizzes } from "@/features/quiz/quizzes";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = quizzes.find((q) => q.id === id);

  if (!quiz) return <p className="p-8">Quiz not found</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>

      <form className="space-y-4">
        <input
          type="text"
          defaultValue={quiz.title}
          className="w-full p-2 border rounded"
        />
        <textarea
          defaultValue={quiz.description}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          defaultValue={quiz.group}
          className="w-full p-2 border rounded"
        />

        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save (Dummy)
        </button>
      </form>
    </main>
  );
}

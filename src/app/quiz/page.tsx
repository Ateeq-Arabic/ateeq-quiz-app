import { sampleQuiz } from "@/features/quiz/sampleQuiz";

export default function QuizPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sample Quiz</h1>
      {sampleQuiz.map((q) => (
        <div key={q.id} className="mb-8">
          <p className="mb-4 text-lg">{q.prompt}</p>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                className="block w-full p-3 border rounded-lg hover:bg-blue-100"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}

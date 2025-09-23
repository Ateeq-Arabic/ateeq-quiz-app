export default function NewQuizPage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Quiz Title"
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Group"
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

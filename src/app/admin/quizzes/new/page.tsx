"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState("");

  function onSave() {
    // dummy behavior: for now just navigate back to list
    // later this will call Supabase insert
    router.push("/admin/quizzes");
  }

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create New Quiz</h2>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz title"
          className="w-full p-2 border rounded"
        />
        <input
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Group (category)"
          className="w-full p-2 border rounded"
        />

        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded"
          >
            Save
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

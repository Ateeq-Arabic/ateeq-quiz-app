"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSave() {
    setLoading(true);
    const generatedSlug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""); // simple slugify

    const { data, error } = await supabase
      .from("quizzes")
      .insert([{ title, group, slug: generatedSlug }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Error creating quiz: " + error.message);
      return;
    }

    // Redirect to edit page of this new quiz
    router.push(`/admin/quizzes/${data.id}`);
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
            disabled={loading}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
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

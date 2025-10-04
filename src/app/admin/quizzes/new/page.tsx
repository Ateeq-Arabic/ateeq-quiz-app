"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupList, setGroupList] = useState<string[]>([]);

  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase
        .from("quizzes")
        .select("group")
        .not("group", "is", null);

      if (!error && data) {
        const uniqueGroups = Array.from(new Set(data.map((d) => d.group)));
        setGroupList(uniqueGroups as string[]);
      }
    }
    fetchGroups();
  }, []);

  async function onSave() {
    if (!title.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    if (!group.trim()) {
      alert("Group cannot be empty.");
      return;
    }

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

        <div>
          <label className="block text-sm font-medium mb-1">Group</label>
          <select
            value={group}
            onChange={(e) => {
              if (e.target.value === "__new") {
                const newGroup = prompt("Enter new group name:");
                if (newGroup) {
                  setGroup(newGroup);
                  setGroupList((prev) =>
                    prev.includes(newGroup) ? prev : [...prev, newGroup]
                  );
                }
              } else {
                setGroup(e.target.value);
              }
            }}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              -- Select group --
            </option>
            {groupList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
            <option value="__new">+ Add new group</option>
          </select>
        </div>

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

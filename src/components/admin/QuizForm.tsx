"use client";

import type { Quiz } from "@/features/quiz/types";
import { useState, useEffect } from "react";

export default function QuizForm({
  quiz,
  onChange,
  groupList = [],
}: {
  quiz: Quiz;
  onChange: (next: Partial<Quiz>) => void;
  groupList?: string[];
}) {
  const [local, setLocal] = useState(quiz);

  // keep local in sync if parent updates quiz
  useEffect(() => setLocal(quiz), [quiz]);

  function updateField<K extends keyof Quiz>(key: K, value: Quiz[K]) {
    setLocal((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });
    onChange({ [key]: value });
  }

  return (
    <div className="p-4 border rounded">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            value={local.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={local.description ?? ""}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Group</label>
          <select
            value={local.group ?? ""}
            onChange={(e) => {
              if (e.target.value === "__new") {
                const newGroup = prompt("Enter new group name:");
                if (newGroup) {
                  updateField("group", newGroup);
                  if (!groupList.includes(newGroup)) {
                    groupList.push(newGroup); // quick local add
                  }
                }
              } else {
                updateField("group", e.target.value);
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

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            value={local.slug ?? ""}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="letters-lesson-1"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Used in URL, must be unique (e.g., <code>letters-1</code>)
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { Quiz } from "@/features/quiz/types";

export default function QuizForm({
  quiz,
  updateMeta,
  groupList = [],
}: {
  quiz: Quiz;
  updateMeta: (next: Partial<Quiz>) => void;
  groupList?: string[];
}) {
  return (
    <div className="p-4 border rounded">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            value={quiz.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={quiz.description ?? ""}
            onChange={(e) => updateMeta({ description: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Group</label>
          <select
            value={quiz.group ?? ""}
            onChange={(e) => {
              if (e.target.value === "__new") {
                const newGroup = prompt("Enter new group name:");
                if (newGroup) {
                  updateMeta({ group: newGroup });
                  if (!groupList.includes(newGroup)) {
                    groupList.push(newGroup); // quick local add
                  }
                }
              } else {
                updateMeta({ group: e.target.value });
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
            value={quiz.slug ?? ""}
            onChange={(e) => updateMeta({ slug: e.target.value })}
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

"use client";

import { useState, useEffect } from "react";
import type { LocalQuestion } from "@/features/quiz/types";
import OptionEditor from "./OptionEditor";
import Image from "next/image";
import MediaPicker from "./media/MediaPicker";

export default function QuestionEditor({
  question,
  onSave,
}: {
  question: LocalQuestion;
  onSave: (updatedQ: LocalQuestion) => void;
}) {
  const [localQ, setLocalQ] = useState<LocalQuestion>({ ...question });
  const [saving, setSaving] = useState(false);

  const [picker, setPicker] = useState<{
    bucket: "quiz-images" | "quiz-audio";
    type: "promptAudio" | "promptImage";
  } | null>(null);

  // cleanup object URLs on unmount (optional but good)
  useEffect(() => {
    return () => {
      // If you created any object URLs earlier, revoke them here.
      // (You might want to keep a small array of created URLs if you care.)
    };
  }, []);

  function handleChange<K extends keyof LocalQuestion>(
    field: K,
    value: LocalQuestion[K]
  ) {
    setLocalQ((q) => ({ ...q, [field]: value }));
  }

  async function handleClick() {
    try {
      setSaving(true);
      onSave(localQ);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Prompt (text)</label>
        <textarea
          value={localQ.promptText ?? ""}
          onChange={(e) => handleChange("promptText", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* audio/image uploads */}
      <div className="grid grid-cols-1 gap-3">
        {/* Prompt audio */}
        <div>
          <label className="block text-sm">Prompt audio</label>
          {localQ.promptAudio ? (
            <div className="flex items-center gap-3">
              <audio controls src={localQ.promptAudio} />
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    // keep the File (for upload later) and a preview URL
                    handleChange("_newPromptAudioFile", file);
                    handleChange("promptAudio", preview);
                  }
                }}
              />
            </div>
          ) : (
            <input
              className="p-3 border rounded cursor-pointer bg-amber-300"
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const preview = URL.createObjectURL(file);
                  handleChange("_newPromptAudioFile", file);
                  handleChange("promptAudio", preview);
                }
              }}
            />
          )}

          <button
            onClick={() =>
              setPicker({ bucket: "quiz-audio", type: "promptAudio" })
            }
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
          >
            Choose Existing
          </button>
        </div>

        {/* Prompt image */}
        <div>
          <label className="block text-sm">Prompt image</label>
          {localQ.promptImage ? (
            <div className="flex items-center gap-3">
              <Image
                src={localQ.promptImage}
                alt="Prompt"
                className="w-32 h-32 object-cover rounded"
                width={96}
                height={96}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    handleChange("_newPromptImageFile", file);
                    handleChange("promptImage", preview);
                  }
                }}
              />
            </div>
          ) : (
            <input
              className="p-3 border rounded cursor-pointer bg-emerald-300"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const preview = URL.createObjectURL(file);
                  handleChange("_newPromptImageFile", file);
                  handleChange("promptImage", preview);
                }
              }}
            />
          )}

          <button
            onClick={() =>
              setPicker({ bucket: "quiz-images", type: "promptImage" })
            }
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
          >
            Choose Existing
          </button>
        </div>
      </div>

      {/* type-specific editors */}
      {(localQ.qType ?? "mcq") === "mcq" && (
        <div>
          <h4 className="font-medium mb-2">Options</h4>
          <OptionEditor
            options={localQ.options ?? []}
            correctOptionId={localQ.correctOptionId}
            onChange={(opts, correctId) =>
              setLocalQ((q) => ({
                ...q,
                options: opts,
                correctOptionId: correctId,
              }))
            }
          />
        </div>
      )}

      {(localQ.qType ?? "mcq") === "true_false" && (
        <div>
          <label className="block text-sm">Expected answer</label>
          <select
            value={localQ.expectedAnswer ?? "true"}
            onChange={(e) => handleChange("expectedAnswer", e.target.value)}
            className="p-2 border rounded"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      )}

      {(localQ.qType ?? "mcq") === "fill_blank" && (
        <div>
          <label className="block text-sm">Expected answer</label>
          <input
            type="text"
            lang="ar"
            dir="rtl"
            value={localQ.expectedAnswer ?? ""}
            onChange={(e) => handleChange("expectedAnswer", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleClick}
        disabled={saving}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded cursor-pointer disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Question"}
      </button>

      {picker && (
        <MediaPicker
          bucket={picker.bucket}
          onSelect={(url, path) => {
            if (picker.type === "promptAudio") {
              handleChange("promptAudio", url);
              handleChange("promptAudioPath", path);
            } else {
              handleChange("promptImage", url);
              handleChange("promptImagePath", path);
            }
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

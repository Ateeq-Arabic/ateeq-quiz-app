"use client";

import React from "react";
import type { LocalOption } from "@/features/quiz/types";
import Image from "next/image";

export default function OptionEditor({
  options,
  correctOptionId,
  onChange,
}: {
  options: LocalOption[];
  correctOptionId?: string;
  onChange: (next: LocalOption[], correctId?: string) => void;
}) {
  function updateOpt(id: string, patch: Partial<LocalOption>) {
    onChange(
      options.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      correctOptionId
    );
  }

  function setCorrect(id: string) {
    onChange(options, id);
  }

  function addOption() {
    const tempId = `temp-${Date.now()}`;
    onChange([...options, { id: tempId, text: "" }]);
  }

  function removeOption(id: string) {
    onChange(
      options.filter((o) => o.id !== id),
      correctOptionId === id ? undefined : correctOptionId
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((o) => (
          <div key={o.id} className="p-3 border rounded grid grid-cols-1 gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="radio"
                checked={correctOptionId === o.id}
                onChange={() => setCorrect(o.id)}
              />
              <input
                value={o.text ?? ""}
                onChange={(e) => updateOpt(o.id, { text: e.target.value })}
                placeholder="Option text (Arabic allowed)"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => removeOption(o.id)}
                className="px-2 py-1 border rounded"
              >
                Delete
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* IMAGE preview + replace */}
              <div>
                <label className="block text-sm">Option image</label>
                {o.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <Image
                      src={o.imageUrl}
                      alt="option image"
                      className="w-24 h-24 object-cover rounded"
                      width={96}
                      height={96}
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const preview = URL.createObjectURL(f);
                            updateOpt(o.id, {
                              _newImageFile: f,
                              imageUrl: preview,
                            });
                          }
                        }}
                      />
                      <small className="text-sm text-gray-500">
                        Replace image
                      </small>
                    </div>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const preview = URL.createObjectURL(f);
                        updateOpt(o.id, {
                          _newImageFile: f,
                          imageUrl: preview,
                        });
                      }
                    }}
                  />
                )}
              </div>

              {/* AUDIO preview + replace */}
              <div>
                <label className="block text-sm">Option audio</label>
                {o.audioUrl ? (
                  <div className="flex items-center gap-3">
                    <audio controls src={o.audioUrl} />
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          // set preview (object url) and keep File
                          const preview = URL.createObjectURL(f);
                          updateOpt(o.id, {
                            _newAudioFile: f,
                            audioUrl: preview,
                          });
                        }
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const preview = URL.createObjectURL(f);
                        updateOpt(o.id, {
                          _newAudioFile: f,
                          audioUrl: preview,
                        });
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={addOption} className="px-3 py-1 border rounded">
          + Add option
        </button>
      </div>
    </div>
  );
}

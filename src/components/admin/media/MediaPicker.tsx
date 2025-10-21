"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/ToastProvider";
import Image from "next/image";

interface MediaPickerProps {
  bucket: "quiz-images" | "quiz-audio";
  onSelect: (url: string, path: string) => void;
  onClose: () => void;
}

export default function MediaPicker({
  bucket,
  onSelect,
  onClose,
}: MediaPickerProps) {
  const [files, setFiles] = useState<
    { name: string; url: string; path: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    async function loadFiles() {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list("", { limit: 100 });
      if (error) {
        console.error("Failed to list media:", error.message);
        toast("Failed to list media" + error.message, "error");
      } else if (data) {
        const listed = data.map((f) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(f.name);
          return { name: f.name, url: publicUrl, path: f.name };
        });
        setFiles(listed);
      }
      setLoading(false);
    }
    loadFiles();
  }, [bucket, toast]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Select from existing{" "}
          {bucket === "quiz-images" ? "images" : "audio files"}
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500">No files found in {bucket}</p>
        ) : (
          <ul className="space-y-3">
            {files.map((f) => (
              <li
                key={f.path}
                className="border rounded p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                onClick={() => {
                  onSelect(f.url, f.path);
                  onClose();
                }}
              >
                <span>{f.name}</span>
                {bucket === "quiz-images" ? (
                  <Image
                    src={f.url}
                    alt={f.name}
                    className="h-10 w-10 object-cover rounded"
                    width={96}
                    height={96}
                  />
                ) : (
                  <audio src={f.url} controls className="h-8" />
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

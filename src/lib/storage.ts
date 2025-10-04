// src/lib/storage.ts
import { supabase } from "./supabaseClient";

export async function uploadFile(
  bucket: string,
  file: File,
  oldPath?: string
): Promise<{ publicUrl: string; path: string }> {
  // 1) Upload new file
  const filePath = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    window.alert("File upload failed: " + uploadError?.message);
    throw uploadError;
  }

  // 2) Get public url for new file
  const {
    data: { publicUrl },
  } = await supabase.storage.from(bucket).getPublicUrl(filePath);

  // 3) Attempt to delete old file AFTER successful upload
  if (oldPath && oldPath !== filePath) {
    const { error: delError } = await supabase.storage
      .from(bucket)
      .remove([oldPath]);
    if (delError) {
      // warn but don't throw — we still have the new file
      console.warn("Failed to delete old file:", delError.message);
      window.alert("Warning: failed to delete old file: " + delError.message);
    }
  }

  return { publicUrl, path: filePath };
}

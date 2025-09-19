import Image from "next/image";
import { renderPrompt } from "@/features/quiz/utils/renderPrompt";

interface OptionItemProps {
  id: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export default function OptionItem({
  id,
  text,
  imageUrl,
  audioUrl,
}: OptionItemProps) {
  const hasText = !!text;
  const hasImage = !!imageUrl;
  const hasAudio = !!audioUrl;

  return (
    <li
      key={id}
      className="p-4 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--accent)]/10 transition"
    >
      {/* Case 1: text + (image or audio) → flex layout */}
      {hasText && (hasImage || hasAudio) && (
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 text-center">{renderPrompt(text!)}</div>
          {hasImage && (
            <Image
              src={imageUrl!}
              alt={text ?? ""}
              width={80}
              height={80}
              className="h-20 w-auto object-contain"
            />
          )}
          {hasAudio && (
            <audio src={audioUrl!} controls className="max-w-[200px]" />
          )}
        </div>
      )}

      {/* Case 2: only text */}
      {hasText && !hasImage && !hasAudio && (
        <div className="text-center">{renderPrompt(text!)}</div>
      )}

      {/* Case 3: only image */}
      {!hasText && hasImage && (
        <div className="flex justify-center">
          <Image
            src={imageUrl!}
            alt=""
            width={120}
            height={120}
            className="h-28 w-auto object-contain"
          />
        </div>
      )}

      {/* Case 4: only audio */}
      {!hasText && hasAudio && (
        <div className="flex justify-center">
          <audio src={audioUrl!} controls className="max-w-[250px]" />
        </div>
      )}
    </li>
  );
}

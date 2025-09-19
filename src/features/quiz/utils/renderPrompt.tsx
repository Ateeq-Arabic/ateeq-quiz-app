// utils/renderPrompt.tsx
import type { PromptPart } from "@/features/quiz/types";

// Grapheme-aware Arabic renderer
export function renderPromptText(text: string) {
  return text.split(/(\p{Script=Arabic}[\p{M}]*)/gu).map((part, i) => {
    const isArabic = /\p{Script=Arabic}/u.test(part);
    return (
      <span
        key={i}
        className={isArabic ? "font-arabic text-2xl mx-1" : "font-english"}
      >
        {part}
      </span>
    );
  });
}

export function renderPromptParts(parts: PromptPart[]) {
  return parts.map((p, idx) => (
    <span
      key={idx}
      className={p.lang === "ar" ? "font-arabic text-2xl mx-1" : "font-english"}
    >
      {p.text}
    </span>
  ));
}

export function renderPrompt(promptText?: string, promptParts?: PromptPart[]) {
  if (promptParts) return renderPromptParts(promptParts);
  if (promptText) return renderPromptText(promptText);
  return null;
}

import type { PromptPart } from "@/features/quiz/types";

// Grapheme-aware Arabic renderer
export function renderPromptText(text: string) {
  // Group sequences of Arabic or non-Arabic text together
  return text
    .split(/([\p{Script=Arabic}\s]+|[^\p{Script=Arabic}\s]+)/gu)
    .map((part, i) => {
      if (!part.trim()) return null; // skip empty parts
      const isArabic = /\p{Script=Arabic}/u.test(part);
      return (
        <span
          key={i}
          dir={isArabic ? "rtl" : "ltr"}
          className={`${
            isArabic ? "font-arabic text-2xl leading-relaxed" : "font-english"
          } mx-1 inline-block`}
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

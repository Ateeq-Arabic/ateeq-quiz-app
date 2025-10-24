import type { PromptPart } from "@/features/quiz/types";

/**
 * Heuristic: does the string contain any Arabic letters?
 * (Punctuation like "،" is Script=Common, so we don't rely on punctuation.)
 */
function hasArabicLetters(s: string) {
  return /\p{Script=Arabic}/u.test(s);
}

/** Detects Latin letters. */
function hasLatinLetters(s: string) {
  return /[A-Za-z]/.test(s);
}

export function renderPromptText(text: string) {
  const hasArabic = hasArabicLetters(text);
  const hasLatin = hasLatinLetters(text);
  const direction = hasArabic && hasLatin ? "auto" : hasArabic ? "rtl" : "ltr";

  return (
    <span
      dir={direction}
      className={
        (hasArabic
          ? "font-arabic text-2xl leading-relaxed"
          : "font-english text-xl leading-snug") + " whitespace-pre-wrap"
      }
    >
      {text}
    </span>
  );
}

export function renderPromptParts(parts: PromptPart[]) {
  return parts.map((p, idx) => {
    const isArabic = p.lang === "ar";
    return (
      <span
        key={idx}
        lang={isArabic ? "ar" : "en"}
        dir={isArabic ? "rtl" : "ltr"}
        className={
          (isArabic
            ? "font-arabic text-2xl leading-relaxed"
            : "font-english text-xl leading-snug") + " whitespace-pre-wrap"
        }
      >
        {p.text}
      </span>
    );
  });
}

export function renderPrompt(promptText?: string, promptParts?: PromptPart[]) {
  if (promptParts) return renderPromptParts(promptParts);
  if (promptText) return renderPromptText(promptText);
  return null;
}

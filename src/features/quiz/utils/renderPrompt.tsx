import type { PromptPart } from "@/features/quiz/types";

/**
 * Heuristic: does the string contain any Arabic letters?
 * (Punctuation like "،" is Script=Common, so we don't rely on punctuation.)
 */
function hasArabicLetters(s: string) {
  return /\p{Script=Arabic}/u.test(s);
}

/** Split into Arabic vs non-Arabic runs */
function splitByArabicRunsRaw(text: string) {
  const runs: { part: string; isArabic: boolean }[] = [];
  const re = /(\p{Script=Arabic}+(?:\p{M}+)*)/gu;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push({ part: text.slice(last, m.index), isArabic: false });
    }
    runs.push({ part: m[0], isArabic: true });
    last = re.lastIndex;
  }
  if (last < text.length)
    runs.push({ part: text.slice(last), isArabic: false });
  return runs;
}

/** Merge whitespace into previous run; coalesce same-script neighbors */
function normalizeRuns(runs: { part: string; isArabic: boolean }[]) {
  const out: { part: string; isArabic: boolean }[] = [];
  for (const r of runs) {
    if (/^\s+$/.test(r.part)) {
      // whitespace: append to previous run to avoid standalone “space spans”
      if (out.length) out[out.length - 1].part += r.part;
      else out.push(r); // leading whitespace, keep once
      continue;
    }
    // coalesce with previous if same script
    if (out.length && out[out.length - 1].isArabic === r.isArabic) {
      out[out.length - 1].part += r.part;
    } else {
      out.push({ ...r });
    }
  }
  return out;
}

export function renderPromptText(text: string) {
  const hasArabic = hasArabicLetters(text);

  // Single-language: one span (fast path, perfect copy, minimal markup)
  if (!hasArabic || text.replace(/\s+/g, "").length === 0) {
    return (
      <span
        dir={hasArabic ? "rtl" : "ltr"}
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

  // Mixed-language: split + normalize, but DO NOT set dir on inner spans
  const runs = normalizeRuns(splitByArabicRunsRaw(text));

  return (
    <span dir="auto" className="whitespace-pre-wrap">
      {runs.map((r, i) => (
        <span
          key={i}
          className={
            r.isArabic
              ? "font-arabic text-2xl leading-relaxed"
              : "font-english text-xl leading-snug"
          }
        >
          {r.part}
        </span>
      ))}
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

"use client";

import Image from "next/image";
import { renderPrompt } from "@/features/quiz/utils/renderPrompt";
import { useQuizStore } from "@/store/quizStore";

interface OptionItemProps {
  qid: string; // question id
  id: string; // option id
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export default function OptionItem({
  qid,
  id,
  text,
  imageUrl,
  audioUrl,
}: OptionItemProps) {
  const answers = useQuizStore((s) => s.answers);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const finished = useQuizStore((s) => s.finished);
  const result = useQuizStore((s) => s.result);

  const selected = answers[qid] === id;

  // After finish → highlight answers
  let highlightClass = "";
  if (finished && result) {
    const detail = result.details.find((d) => d.questionId === qid);
    if (detail) {
      if (detail.correctAnswer === id) {
        highlightClass = "bg-green-100 border-green-400"; // correct
      } else if (detail.userAnswer === id && !detail.isCorrect) {
        highlightClass = "bg-red-100 border-red-400"; // wrong selected
      }
    }
  } else if (selected) {
    // Before finish, show selected option in gray
    highlightClass = "bg-[var(--accent)]/30 cursor-default";
  }

  const hasText = !!text;
  const hasImage = !!imageUrl;
  const hasAudio = !!audioUrl;

  return (
    <li
      key={id}
      onClick={() => {
        if (!finished && !selected) setAnswer(qid, id);
      }}
      className={`p-4 rounded-lg border cursor-pointer transition ${
        highlightClass || "hover:bg-[var(--accent)]/15"
      }`}
    >
      {/* Case 1: text + (image or audio) → flex layout */}
      {hasText && (hasImage || hasAudio) && (
        <div className="flex text-3xl items-center justify-center gap-4">
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
        <div className="text-center text-3xl">{renderPrompt(text!)}</div>
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

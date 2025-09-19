import Image from "next/image";
import type { QuizQuestion } from "@/features/quiz/types";
import { renderPrompt } from "@/features/quiz/utils/renderPrompt";

type QuestionLayoutProps = {
  question: QuizQuestion;
  children: React.ReactNode; // where answer UI will go
};

export default function QuestionLayout({
  question,
  children,
}: QuestionLayoutProps) {
  return (
    <div className="p-6">
      {/* Prompt */}
      {(question.promptText || question.promptParts) && (
        <h2 className="font-semibold text-lg mb-6 text-center">
          {renderPrompt(question.promptText, question.promptParts)}
        </h2>
      )}

      {/* Prompt Audio */}
      {question.promptAudio && (
        <div className="flex justify-center mb-6">
          <audio src={question.promptAudio} controls />
        </div>
      )}

      {/* Prompt Image */}
      {question.promptImage && (
        <div className="flex justify-center mb-6">
          <Image
            src={question.promptImage}
            alt="Prompt"
            width={160}
            height={160}
            className="h-32 w-auto object-contain"
          />
        </div>
      )}

      {/* Answer UI (from child component) */}
      <div>{children}</div>
    </div>
  );
}

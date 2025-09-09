import { QuizQuestion } from "./types";

export const sampleQuiz: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What is the Arabic letter for the sound 'b'?",
    options: [
      { id: "o1", text: "ب" },
      { id: "o2", text: "ت" },
      { id: "o3", text: "ث" },
    ],
    correctOptionId: "o1",
  },
  {
    id: "q2",
    prompt: "Which letter is pronounced 'ta'?",
    options: [
      { id: "o1", text: "ب" },
      { id: "o2", text: "ت" },
      { id: "o3", text: "ج" },
    ],
    correctOptionId: "o2",
  },
];

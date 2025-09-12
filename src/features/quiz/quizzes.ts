import type { Quiz } from "./types";

export const quizzes: Quiz[] = [
  {
    id: "mcq-letters-1",
    slug: "letters-1",
    title: "MCQ — Letter Sounds (Set 1)",
    description: "Choose the correct short-vowel sound for the letter.",
    type: "mcq",
    questions: [
      {
        id: "q1",
        promptText: "What is the sound of the letter ب with fatha?",
        options: [
          { id: "o1", text: "بَ" },
          { id: "o2", text: "بِ" },
          { id: "o3", text: "بُ" },
        ],
        correctOptionId: "o1",
      },
    ],
  },

  {
    id: "tf-joining-1",
    slug: "joining-1",
    title: "True/False — Joining Rules",
    description: "Decide whether the statement is true or false.",
    type: "true_false",
    questions: [
      {
        id: "t1",
        promptText: "The letter د does not connect to the following letter.",
        expectedAnswer: "false",
      },
    ],
  },

  {
    id: "fill-vowels-1",
    slug: "fill-vowels-1",
    title: "Fill — Short Vowels",
    description: "Listen and type the exact word with vowels.",
    type: "fill_blank",
    questions: [
      {
        id: "f1",
        promptText: "Type the word you hear (with vowels).",
        promptAudio: "/audio/samak.mp3",
        expectedAnswer: "سَمَك",
      },
    ],
  },
];

// src/features/quiz/quizzes.ts
import type { Quiz } from "./types";

export const quizzes: Quiz[] = [
  {
    id: "letters-lesson-1",
    slug: "letters-1",
    title: "Letters & Short Vowels — Set 1",
    description: "Basic letter sounds and short vowels (fatha, kasra, damma).",
    type: "mixed",
    group: "Letters",

    questions: [
      // MCQ example (keeps previous structure)
      {
        id: "q1",
        qType: "mcq",
        promptParts: [
          { lang: "en", text: "What is the sound of the letter " },
          { lang: "ar", text: "ب" },
          { lang: "en", text: " with fatha?" },
        ],
        options: [
          {
            id: "o1",
            text: "بَ",
            imageUrl: "",
            lang: "ar",
          },
          {
            id: "o2",
            text: "بِ",
            imageUrl: "",
            lang: "ar",
          },
          {
            id: "o3",
            text: "بُ",
            imageUrl: "",
            lang: "ar",
          },
        ],
        correctOptionId: "o1",
      },

      // True/False example inside the same quiz
      {
        id: "q2",
        qType: "true_false",
        promptParts: [
          { lang: "en", text: "True or False: the letter " },
          { lang: "ar", text: "د" },
          { lang: "en", text: " connects to the following letter." },
        ],
        expectedAnswer: "false",
      },

      // Fill-in example with audio prompt
      {
        id: "q3",
        qType: "fill_blank",
        promptParts: [
          { lang: "en", text: "Type the word you hear (include vowels):" },
        ],
        promptAudio: "/audio/samples/samak.mp3", // placeholder - put file in public/audio/samples/
        expectedAnswer: "سَمَك",
      },
    ],
  },

  {
    id: "joining-lesson-1",
    slug: "joining-1",
    title: "Joining Rules & Letter Forms",
    description: "Practice letter joining and identify non-connecting letters.",
    type: "mixed",
    group: "Joining",

    questions: [
      {
        id: "j1",
        qType: "mcq",
        promptParts: [
          {
            lang: "en",
            text: "Which of these letters does NOT join on the left?",
          },
        ],
        options: [
          {
            id: "o1",
            text: "ب",
            imageUrl: "/images/letters/ba.png",
            lang: "ar",
          },
          {
            id: "o2",
            text: "د",
            imageUrl: "/images/letters/dal.png",
            lang: "ar",
          },
          {
            id: "o3",
            text: "س",
            imageUrl: "/images/letters/seen.png",
            lang: "ar",
          },
        ],
        correctOptionId: "o2",
      },

      {
        id: "j2",
        qType: "true_false",
        promptText:
          "True or False: letters like د, ذ, ر never connect on the left.",
        expectedAnswer: "true",
      },

      {
        id: "j3",
        qType: "fill_blank",
        promptParts: [
          { lang: "en", text: "Listen and type: " },
          { lang: "ar", text: "سَمَك" },
        ],
        promptAudio: "/audio/samples/samak2.mp3",
        expectedAnswer: "سَمَك",
      },
    ],
  },

  {
    id: "vowels-lesson-1",
    slug: "vowels-1",
    title: "Short Vowels & Harakat",
    description: "Recognize, write and pronounce short vowels.",
    type: "mixed",
    group: "Vowels",

    questions: [
      {
        id: "v1",
        qType: "mcq",
        promptParts: [
          { lang: "en", text: "Choose the form that shows fatha:" },
        ],
        options: [
          {
            id: "o1",
            text: "ـَ",
            imageUrl: "/images/vowels/fatha.png",
            lang: "ar",
          },
          {
            id: "o2",
            text: "ـِ",
            imageUrl: "/images/vowels/kasra.png",
            lang: "ar",
          },
          {
            id: "o3",
            text: "ـُ",
            imageUrl: "/images/vowels/damma.png",
            lang: "ar",
          },
        ],
        correctOptionId: "o1",
      },

      {
        id: "v2",
        qType: "true_false",
        promptText:
          "True or False: short vowels are always written in beginner texts.",
        expectedAnswer: "false",
      },

      {
        id: "v3",
        qType: "fill_blank",
        promptParts: [
          { lang: "en", text: "Type the word (with vowels): " },
          { lang: "ar", text: "قَلَم" },
        ],
        promptAudio: "/audio/samples/qalam.mp3",
        expectedAnswer: "قَلَم",
      },
    ],
  },
  {
    id: "letters-lesson-2",
    slug: "letters-2",
    title: "Letters & Short Vowels — Set 2",
    description: "Basic letter sounds and short vowels (fatha, kasra, damma).",
    type: "mixed",
    group: "Others",

    questions: [
      // MCQ example (keeps previous structure)
      {
        id: "q1",
        qType: "mcq",
        promptParts: [
          { lang: "en", text: "What is the sound of the letter " },
          { lang: "ar", text: "ب" },
          { lang: "en", text: " with fatha?" },
        ],
        options: [
          {
            id: "o1",
            text: "",
            imageUrl: "/images/Picsart_25-07-11_17-43-54-205.png",
            lang: "ar",
          },
          {
            id: "o2",
            text: "",
            imageUrl: "/images/Picsart_25-07-11_17-43-54-205.png",
            lang: "ar",
          },
          {
            id: "o3",
            text: "",
            imageUrl: "/images/Picsart_25-07-11_17-43-54-205.png",
            lang: "ar",
          },
        ],
        correctOptionId: "o1",
      },

      // True/False example inside the same quiz
      {
        id: "q2",
        qType: "true_false",
        promptParts: [
          { lang: "en", text: "True or False: the letter " },
          { lang: "ar", text: "د" },
          { lang: "en", text: " connects to the following letter." },
        ],
        expectedAnswer: "false",
      },

      // Fill-in example with audio prompt
      {
        id: "q3",
        qType: "fill_blank",
        promptParts: [
          { lang: "en", text: "Type the word you hear (include vowels):" },
        ],
        promptAudio: "/audio/samples/samak.mp3", // placeholder - put file in public/audio/samples/
        expectedAnswer: "سَمَك",
      },
    ],
  },
];

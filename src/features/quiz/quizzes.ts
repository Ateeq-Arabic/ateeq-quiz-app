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
            text: "",
            imageUrl:
              "https://i.pinimg.com/736x/54/ff/fd/54fffd7c9812ce6941a23d7e4091f397.jpg",
            lang: "ar",
          },
          {
            id: "o2",
            text: "",
            imageUrl:
              "https://i.pinimg.com/736x/3e/85/80/3e85803d8329a4dd8a01160f2ee48bea.jpg",
            lang: "ar",
          },
          {
            id: "o3",
            text: "",
            imageUrl:
              "https://i.pinimg.com/736x/27/52/51/2752517a41864e922bafb0fe10f6532e.jpg",
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
        promptAudio:
          "https://drive.google.com/uc?export=download&id=1aQLh1W-IMLmqFgwuKu5IwQw-_SXcXkAY",
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
            imageUrl: "",
            audioUrl: "/audio/samples/ba_fatha.mp3",
            lang: "ar",
          },
          {
            id: "o2",
            text: "",
            imageUrl:
              "https://i.pinimg.com/736x/c0/b8/5a/c0b85a37ce08bbdc37a0df295184688d.jpg",
            audioUrl: "/audio/samples/ba_fatha.mp3",
            lang: "ar",
          },
          {
            id: "o3",
            text: "ي",
            imageUrl:
              "https://i.pinimg.com/736x/04/a2/9b/04a29be41fec079ef37bb70b2af92bd1.jpg",
            audioUrl: "/audio/samples/ba_fatha.mp3",
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

export type QuizType = "mcq" | "true_false" | "fill_blank";

export type QuizOption = {
  id: string;
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
};

export type QuizQuestion = {
  id: string;
  promptText?: string;
  promptAudio?: string;
  promptImage?: string;
  options?: QuizOption[]; // for MCQ
  correctOptionId?: string; // for MCQ
  expectedAnswer?: string; // for fill-in
};

export type Quiz = {
  id: string; // unique id
  slug?: string; // optional friendly slug
  title: string;
  description?: string;
  type: QuizType;
  questions: QuizQuestion[];
};

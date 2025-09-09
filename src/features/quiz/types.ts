export type QuizOption = {
  id: string; // unique ID for the option
  text?: string; // option text (optional, because could be audio/image later)
  audioUrl?: string; // optional audio
  imageUrl?: string; // optional image
};

export type QuizQuestion = {
  id: string; // unique ID for the question
  prompt: string; // the question text
  options: QuizOption[]; // list of possible answers
  correctOptionId: string; // which option is correct
};

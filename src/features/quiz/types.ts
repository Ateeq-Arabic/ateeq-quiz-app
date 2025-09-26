export type QuizType = "mcq" | "true_false" | "fill_blank" | "mixed";

/** Option for MCQ answers — can carry text, image, or audio */
export type QuizOption = {
  id: string;
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
  lang?: "ar" | "en"; // optional language hint for rendering
};

/** Small chunk of prompt text with explicit language */
export type PromptPart = {
  lang: "ar" | "en";
  text: string;
};

export type QuizQuestion = {
  id: string;

  /** A single string fallback prompt (legacy) */
  promptText?: string;

  /** Structured prompt segments (preferred) */
  promptParts?: PromptPart[];

  promptAudio?: string;
  promptImage?: string;

  /** Question-level type — when a quiz has mixed types */
  qType?: QuizType;

  /** For MCQ */
  options?: QuizOption[];
  correctOptionId?: string;

  /** For fill-in */
  expectedAnswer?: string;
};

export type Quiz = {
  id: string;
  slug?: string;
  title: string;
  description?: string;

  /** Optional top-level 'type' — can still be used as a hint or legacy value.
      Not required because questions may be mixed. */
  type?: QuizType;

  /** New: group for homepage grouping (e.g., "Letters", "Vowels") */
  group?: string;

  questions: QuizQuestion[];
};

/** Types that match Supabase tables (snake_case) */
export type DBQuiz = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  type: QuizType | null;
  group: string | null;
};

export type DBQuestion = {
  id: string;
  quiz_id: string;
  q_type: QuizType | null;
  prompt_text: string | null;
  prompt_audio: string | null;
  prompt_image: string | null;
  expected_answer: string | null;
  correct_option_id: string | null;
};

export type DBOption = {
  id: string;
  question_id: string;
  text?: string;
  image_url?: string;
  audio_url?: string;
  lang?: "ar" | "en";
  is_correct: boolean;
};

export type DBQuestionWithOptions = DBQuestion & {
  options: DBOption[];
};

"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { uploadFile } from "@/lib/storage";
import QuizForm from "@/components/admin/QuizForm";
import QuestionEditor from "@/components/admin/QuestionEditor";
import type {
  Quiz,
  QuizQuestion,
  QuizType,
  DBQuestionWithOptions,
  LocalQuestion,
  LocalOption,
} from "@/features/quiz/types";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/ToastProvider";

export default function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toast = useToast();

  // fetch quiz + questions
  useEffect(() => {
    async function fetchQuiz() {
      const { data, error } = await supabase
        .from("quizzes")
        .select(
          `
    id, title, description, group, slug,
    questions:questions (
      id, q_type, prompt_text, prompt_audio, prompt_image,
      prompt_audio_path, prompt_image_path, expected_answer,
      options:options (
        id, text, image_url, audio_url,
        image_path, audio_path, lang, is_correct
      )
    )
    `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast("Failed to load quiz: " + error.message, "error");
      } else {
        setQuiz({
          id: data.id,
          title: data.title,
          description: data.description,
          group: data.group,
          slug: data.slug ?? undefined,
          questions: (data.questions as DBQuestionWithOptions[]).map(
            (q): QuizQuestion => ({
              id: q.id,
              qType: q.q_type ?? undefined,
              promptText: q.prompt_text ?? undefined,
              promptAudio: q.prompt_audio ?? undefined,
              promptAudioPath: q.prompt_audio_path ?? undefined,
              promptImage: q.prompt_image ?? undefined,
              promptImagePath: q.prompt_image_path ?? undefined,
              expectedAnswer: q.expected_answer ?? undefined,
              options: q.options?.map((o) => ({
                id: o.id,
                text: o.text ?? undefined,
                imageUrl: o.image_url ?? undefined,
                imagePath: o.image_path ?? undefined,
                audioUrl: o.audio_url ?? undefined,
                audioPath: o.audio_path ?? undefined,
                lang: o.lang as "ar" | "en" | undefined,
              })),
              correctOptionId: q.options?.find((o) => o.is_correct)?.id,
            })
          ),
        });
      }
      setLoading(false);
    }

    fetchQuiz();
  }, [id, toast]);

  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase
        .from("quizzes")
        .select("group")
        .not("group", "is", null);

      if (!error && data) {
        const uniqueGroups = Array.from(new Set(data.map((d) => d.group)));
        setGroups(uniqueGroups as string[]);
      }
    }

    fetchGroups();
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (loading) return <p className="p-4">Loading...</p>;

  if (!quiz)
    return (
      <main className="p-4">
        <p>Quiz not found</p>
        <Link href="/admin/quizzes" className="text-blue-600 hover:underline">
          Back to list
        </Link>
      </main>
    );

  function validateQuestion(q: QuizQuestion): string | null {
    if (!q.promptText && !q.promptImage && !q.promptAudio) {
      return "Question must have text, image, or audio.";
    }

    if (q.qType === "true_false" && !q.expectedAnswer) {
      return "True/False question must have an expected answer.";
    }

    if (q.qType === "fill_blank" && !q.expectedAnswer?.trim()) {
      return "Fill-in-the-blank must have an expected answer.";
    }

    if (q.qType === "mcq") {
      if (!q.options || q.options.length < 2) {
        return "MCQ must have at least 2 options.";
      }

      for (const opt of q.options) {
        if (!opt.text && !opt.imageUrl && !opt.audioUrl) {
          return "Each option must have text, image, or audio.";
        }
      }
    }

    return null;
  }

  async function saveQuestion(qId: string, updatedQ: LocalQuestion) {
    // client-side validation first
    const validationError = validateQuestion(updatedQ);
    if (validationError) {
      console.log(validationError);
      toast(validationError, "error");
      return;
    }

    try {
      // 1) Upload any files marked for upload on client side.
      // prompt image/audio
      if (updatedQ._newPromptImageFile) {
        const upl = await uploadFile(
          "quiz-images",
          updatedQ._newPromptImageFile,
          updatedQ.promptImagePath ?? undefined
        );
        updatedQ.promptImage = upl.publicUrl;
        updatedQ.promptImagePath = upl.path;
        delete updatedQ._newPromptImageFile;
      }
      if (updatedQ._newPromptAudioFile) {
        const upl = await uploadFile(
          "quiz-audio",
          updatedQ._newPromptAudioFile,
          updatedQ.promptAudioPath ?? undefined
        );
        updatedQ.promptAudio = upl.publicUrl;
        updatedQ.promptAudioPath = upl.path;
        delete updatedQ._newPromptAudioFile;
      }

      // options files
      for (const opt of updatedQ.options ?? []) {
        if ((opt as LocalOption)._newImageFile) {
          const _opt = opt as LocalOption;
          const upl = await uploadFile(
            "quiz-images",
            _opt._newImageFile!,
            _opt.imagePath ?? undefined
          );
          _opt.imageUrl = upl.publicUrl;
          _opt.imagePath = upl.path;
          delete _opt._newImageFile;
        }
        if ((opt as LocalOption)._newAudioFile) {
          const _opt = opt as LocalOption;
          const upl = await uploadFile(
            "quiz-audio",
            _opt._newAudioFile!,
            _opt.audioPath ?? undefined
          );
          _opt.audioUrl = upl.publicUrl;
          _opt.audioPath = upl.path;
          delete _opt._newAudioFile;
        }
      }

      // 2) Call server-side endpoint that runs the atomic SQL function
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;

      const res = await fetch("/api/admin/save-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ quizId: quiz!.id, question: updatedQ }),
      });

      const body = await res.json();

      if (!res.ok) {
        console.log(
          "Failed to save question: " + (body?.error ?? res.statusText)
        );
        toast(
          "Failed to save question: " + (body?.error ?? res.statusText),
          "error"
        );
        return;
      }

      // body.data contains the SQL function return
      type SaveQuestionResponse = {
        question_id?: string;
        temp_map?: Record<string, string>;
      };
      const data: SaveQuestionResponse = body?.data ?? body;
      const questionIdFromServer = data?.question_id as string | undefined;
      const tempMap = (data?.temp_map as Record<string, string>) ?? {};

      // 3) Apply mapping (temp id -> real id) to the updated question for UI
      const deep = JSON.parse(JSON.stringify(updatedQ)) as LocalQuestion;

      // replace question id if server created a real one
      if (questionIdFromServer) {
        deep.id = questionIdFromServer;
      } else if (tempMap && tempMap[deep.id]) {
        deep.id = tempMap[deep.id];
      }

      // replace option temp ids
      if (deep.options) {
        deep.options = deep.options.map((o) => {
          const newId = tempMap[o.id] ?? o.id;
          return { ...o, id: newId };
        });
      }

      // map correctOptionId
      if (deep.correctOptionId) {
        deep.correctOptionId =
          tempMap[deep.correctOptionId] ?? deep.correctOptionId;
      }

      // 4) Replace local question in state (replace by old qId)
      setQuiz((s) => ({
        ...s!,
        questions: s!.questions.map((qq) => (qq.id === qId ? deep : qq)),
      }));

      console.log("Question saved!");
      toast("Question saved!", "success");
      setDirty(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("saveQuestion error:", err);
      console.log("Error saving question: " + message);
      toast("Error saving question: " + message, "error");
    }
  }

  function handleFormChange(next: Partial<Quiz>) {
    setQuiz((q) => ({ ...q!, ...next }));
    setDirty(true);
  }

  async function saveQuiz() {
    if (!quiz!.title?.trim()) {
      console.log("Title cannot be empty");
      toast("Title cannot be empty", "error");
      return;
    }
    if (!quiz!.group?.trim()) {
      console.log("Group cannot be empty");
      toast("Group cannot be empty", "error");
      return;
    }
    if (!quiz!.description?.trim()) {
      console.log("Description cannot be empty");
      toast("Description cannot be empty", "error");
      return;
    }
    if (!quiz!.slug?.trim()) {
      console.log("Slug cannot be empty");
      toast("Slug cannot be empty", "error");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("quizzes")
      .update({
        title: quiz!.title,
        description: quiz!.description,
        group: quiz!.group,
        slug: quiz!.slug,
      })
      .eq("id", quiz!.id);

    setSaving(false);

    if (error) {
      console.log("Failed to save quiz: " + error.message);
      toast("Failed to save quiz: " + error.message, "error");
    } else {
      console.log("Quiz saved!");
      toast("Quiz saved!", "success");
      setDirty(false);
    }
  }

  // add new question locally (no DB insert yet)
  async function addQuestion(qType: QuizType) {
    const tempId = "temp-" + uuidv4();

    const newQuestion: LocalQuestion = {
      id: tempId,
      qType,
      promptText: "",
      options: [],
    };

    if (qType === "true_false") {
      newQuestion.expectedAnswer = "true";
    }

    setQuiz((s) => ({
      ...s!,
      questions: [...s!.questions, newQuestion],
    }));
    setDirty(true);
  }

  // remove question (if it's still temp we just remove locally; if it's real we call delete endpoint)
  async function removeQuestion(qId: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    // if temp id, just remove locally
    if (qId.startsWith("temp-")) {
      setQuiz((s) => ({
        ...s!,
        questions: s!.questions.filter((qq) => qq.id !== qId),
      }));
      return;
    }

    try {
      setDeletingId(qId);

      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;

      const res = await fetch("/api/admin/delete-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ questionId: qId }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Unknown" }));
        toast("Failed to delete question: " + (error ?? "Unknown"), "error");
        return;
      }

      setQuiz((s) => ({
        ...s!,
        questions: s!.questions.filter((qq) => qq.id !== qId),
      }));
      toast("Question deleted", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast("Error deleting question: " + msg, "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Edit Quiz</h2>
        <div className="flex gap-2">
          <button
            onClick={saveQuiz}
            disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={() => router.push("/admin/quizzes")}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        </div>
      </div>

      {/* Quiz metadata form */}
      <QuizForm quiz={quiz} onChange={handleFormChange} groupList={groups} />

      {/* Questions section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Questions</h3>
          <div className="flex gap-2">
            <button
              onClick={() => addQuestion("mcq")}
              className="px-3 py-1 rounded bg-[var(--accent)]/20"
            >
              + MCQ
            </button>
            <button
              onClick={() => addQuestion("true_false")}
              className="px-3 py-1 rounded bg-[var(--accent)]/20"
            >
              + T/F
            </button>
            <button
              onClick={() => addQuestion("fill_blank")}
              className="px-3 py-1 rounded bg-[var(--accent)]/20"
            >
              + Fill
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--background)]">
                <div>
                  <strong>Q {idx + 1}</strong> —{" "}
                  <span className="text-sm text-[var(--muted)]">
                    {q.qType ?? "mcq"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => removeQuestion(q.id)}
                    disabled={deletingId === q.id}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    {deletingId === q.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className="p-4">
                <QuestionEditor
                  question={q as LocalQuestion}
                  onSave={(updatedQ) => saveQuestion(q.id, updatedQ)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

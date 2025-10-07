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
  DBQuestion,
  DBQuestionWithOptions,
  LocalQuestion,
  LocalOption,
  DBOption,
} from "@/features/quiz/types";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

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
      } else {
        // Map DB fields to our Quiz type
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
  }, [id]);

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
    // must have some content
    if (!q.promptText && !q.promptImage && !q.promptAudio) {
      return "Question must have text, image, or audio.";
    }

    if (q.qType === "true_false" && !q.expectedAnswer) {
      return "True/False question must have an expected answer.";
    }

    if (q.qType === "fill_blank" && !q.expectedAnswer?.trim()) {
      return "Fill-in-the-blank must have an expected answer.";
    }

    // for MCQ: must have at least 2 options and each option must have content
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
    // validate
    const error = validateQuestion(updatedQ);
    if (error) {
      alert(error);
      return;
    }

    // if it's a temp question -> insert first into DB
    if (qId.startsWith("temp-")) {
      const { data, error } = await supabase
        .from("questions")
        .insert([{ quiz_id: quiz!.id, q_type: updatedQ.qType ?? "mcq" }])
        .select()
        .single();

      if (error) throw error;

      const realId = data.id;
      const oldTempId = updatedQ.id;

      updatedQ.id = realId;
      qId = realId; // replace temp id for rest of logic

      // update local quiz state with real ID immediately
      setQuiz((s) => ({
        ...s!,
        questions: s!.questions.map((qq) =>
          qq.id === oldTempId ? { ...updatedQ, id: realId } : qq
        ),
      }));
    }

    // find original question (server-backed)
    let original = quiz!.questions.find((qq) => qq.id === qId);

    if (!original) {
      original = { ...updatedQ, options: [] };
    }

    // compute deleted option IDs (present in original but not in updated)
    const origIds = new Set((original.options ?? []).map((o) => o.id));
    const updatedIds = new Set(
      (updatedQ.options ?? []).map((o: LocalOption) => o.id)
    );
    const deletedIds = Array.from(origIds).filter((id) => !updatedIds.has(id));

    // 1) Delete removed options (and their storage files) via your existing API endpoint
    for (const delId of deletedIds) {
      // call server API that also deletes storage (delete-option server code does that)
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;
      const res = await fetch("/api/admin/delete-option", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ optionId: delId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          "Failed to delete option: " + (body?.error ?? res.statusText)
        );
      }
    }

    // Map tempId -> realId for newly inserted options (so we can fix correctOptionId)
    const tempIdMap = new Map<string, string>();

    // 2) For each option in updatedQ, handle file uploads (if any) and upsert DB rows.
    // We'll iterate sequentially to keep it simple and safe.
    for (const opt of updatedQ.options ?? []) {
      // NOTE: opt may be "temp-..." id => new option that needs insert
      // If opt._newImageFile or opt._newAudioFile exist => upload them

      // prepare payload for DB
      const payload: Partial<DBOption> = {
        text: opt.text ?? undefined,
        lang: opt.lang ?? undefined,
      };

      // image
      if (opt._newImageFile) {
        // uploadFile will delete the old path (opt.imagePath) if provided
        const upl = await uploadFile(
          "quiz-images",
          opt._newImageFile,
          opt.imagePath ?? undefined
        );

        payload.image_url = upl.publicUrl;
        payload.image_path = upl.path;

        // replace preview URL with real public url
        opt.imageUrl = upl.publicUrl;
        opt.imagePath = upl.path;

        delete opt._newImageFile;
      } else if (opt.imageUrl && opt.imagePath) {
        payload.image_url = opt.imageUrl;
        payload.image_path = opt.imagePath;
      } else {
        payload.image_url = null;
        payload.image_path = null;
      }

      // audio
      if (opt._newAudioFile) {
        const upl = await uploadFile(
          "quiz-audio",
          opt._newAudioFile,
          opt.audioPath ?? undefined
        );

        payload.audio_url = upl.publicUrl;
        payload.audio_path = upl.path;

        opt.audioUrl = upl.publicUrl;
        opt.audioPath = upl.path;

        delete opt._newAudioFile;
      } else if (opt.audioUrl && opt.audioPath) {
        payload.audio_url = opt.audioUrl;
        payload.audio_path = opt.audioPath;
      } else {
        payload.audio_url = null;
        payload.audio_path = null;
      }

      if (String(opt.id).startsWith("temp-")) {
        // new option -> insert
        const { data, error } = await supabase
          .from("options")
          .insert([{ question_id: qId, ...payload }])
          .select()
          .single();
        if (error) throw error;

        // replace temp id with real id for UI
        const oldTempId = opt.id;
        opt.id = data.id;
        tempIdMap.set(oldTempId, data.id);

        // if correctOptionId referenced this temp id, replace it
        if (updatedQ.correctOptionId === oldTempId) {
          updatedQ.correctOptionId = data.id;
        }
      } else {
        // existing -> update
        const { error } = await supabase
          .from("options")
          .update(payload)
          .eq("id", opt.id);
        if (error) throw error;
      }
    }

    // 3) Update question row (prompt_text/audio/image/expected_answer/q_type)
    const questionPayload: Partial<DBQuestion> = {
      prompt_text: updatedQ.promptText ?? null,
      prompt_audio: updatedQ.promptAudio ?? null,
      prompt_audio_path: updatedQ.promptAudioPath ?? null,
      prompt_image: updatedQ.promptImage ?? null,
      prompt_image_path: updatedQ.promptImagePath ?? null,
      expected_answer: updatedQ.expectedAnswer ?? null,
      q_type: updatedQ.qType ?? null,
    };

    // prompt image
    if ((updatedQ as LocalQuestion)._newPromptImageFile) {
      const f = (updatedQ as LocalQuestion)._newPromptImageFile!;
      const upl = await uploadFile(
        "quiz-images",
        f,
        updatedQ.promptImagePath ?? undefined
      );
      questionPayload.prompt_image = upl.publicUrl;
      questionPayload.prompt_image_path = upl.path;
      updatedQ.promptImage = upl.publicUrl;
      updatedQ.promptImagePath = upl.path;
      delete (updatedQ as LocalQuestion)._newPromptImageFile;
    } else if (updatedQ.promptImage && updatedQ.promptImagePath) {
      questionPayload.prompt_image = updatedQ.promptImage;
      questionPayload.prompt_image_path = updatedQ.promptImagePath;
    } else {
      questionPayload.prompt_image = null;
      questionPayload.prompt_image_path = null;
    }

    // prompt audio
    if ((updatedQ as LocalQuestion)._newPromptAudioFile) {
      const f = (updatedQ as LocalQuestion)._newPromptAudioFile!;
      const upl = await uploadFile(
        "quiz-audio",
        f,
        updatedQ.promptAudioPath ?? undefined
      );
      questionPayload.prompt_audio = upl.publicUrl;
      questionPayload.prompt_audio_path = upl.path;
      updatedQ.promptAudio = upl.publicUrl;
      updatedQ.promptAudioPath = upl.path;
      delete (updatedQ as LocalQuestion)._newPromptAudioFile;
    } else if (updatedQ.promptAudio && updatedQ.promptAudioPath) {
      questionPayload.prompt_audio = updatedQ.promptAudio;
      questionPayload.prompt_audio_path = updatedQ.promptAudioPath;
    } else {
      questionPayload.prompt_audio = null;
      questionPayload.prompt_audio_path = null;
    }

    // 4) update question row
    const { error: qError } = await supabase
      .from("questions")
      .update(questionPayload)
      .eq("id", qId);
    if (qError) throw qError;

    // 5) set correct option using rpc if exists
    if (updatedQ.correctOptionId) {
      const { error: rpcErr } = await supabase.rpc("set_correct_option", {
        question_id: qId,
        option_id: updatedQ.correctOptionId,
      });
      if (rpcErr) throw rpcErr;
    }

    // 6) update UI local state (replace question in quiz.questions)
    setQuiz((s) => ({
      ...s!,
      questions: s!.questions.map((qq) =>
        qq.id === qId ? { ...updatedQ } : qq
      ),
    }));

    alert("Question saved!");
  }

  function handleFormChange(next: Partial<Quiz>) {
    setQuiz((q) => ({ ...q!, ...next }));
  }

  async function saveQuiz() {
    if (!quiz!.title?.trim()) {
      alert("Title cannot be empty");
      return;
    }
    if (!quiz!.group?.trim()) {
      alert("Group cannot be empty");
      return;
    }
    if (!quiz!.description?.trim()) {
      alert("Description cannot be empty");
      return;
    }
    if (!quiz!.slug?.trim()) {
      alert("Slug cannot be empty");
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
      alert("Failed to save quiz: " + error.message);
    } else {
      alert("Quiz saved!");
    }
  }

  // add new question
  async function addQuestion(qType: QuizType) {
    const tempId = "temp-" + uuidv4();

    const newQuestion: LocalQuestion = {
      id: tempId,
      qType,
      promptText: "",
      options: [],
    };

    // default expectedAnswer for T/F
    if (qType === "true_false") {
      newQuestion.expectedAnswer = "true";
    }

    setQuiz((s) => ({
      ...s!,
      questions: [...s!.questions, newQuestion],
    }));
  }

  // remove question
  async function removeQuestion(qId: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;

    const res = await fetch("/api/admin/delete-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questionId: qId }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      alert("Failed to delete question: " + error);
      return;
    }

    // update UI state after success
    setQuiz((s) => ({
      ...s!,
      questions: s!.questions.filter((qq) => qq.id !== qId),
    }));
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
                    className="px-2 py-1 border rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-4">
                <QuestionEditor
                  question={q}
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

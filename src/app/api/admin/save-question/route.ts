// src/app/api/admin/save-question/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin, ensureAdmin } from "@/app/api/admin/_utils";

/**
 * Consistent API response contract:
 *  - Success: { success: true, data: ... }
 *  - Failure: { success: false, error: "message" } with appropriate HTTP status
 */

function isUuidLike(s: unknown): boolean {
  return typeof s === "string" && /^[0-9a-fA-F-]{36,36}$/.test(s);
}

export async function POST(req: Request) {
  // 1) Admin check
  const adminCheck = await ensureAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const { quizId, question } = body ?? {};

    // Basic validation of payload shape
    if (!quizId || typeof quizId !== "string" || !isUuidLike(quizId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing quizId (must be UUID string)",
        },
        { status: 400 }
      );
    }

    if (!question || typeof question !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing question payload" },
        { status: 400 }
      );
    }

    // More domain validation: qType and MCQ constraints
    const qType = question.qType ?? "mcq";
    if (qType === "true_false") {
      if (
        !("expectedAnswer" in question) ||
        !["true", "false"].includes(question.expectedAnswer)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "True/False question must have expectedAnswer 'true' or 'false'.",
          },
          { status: 400 }
        );
      }
    }

    if (qType === "fill_blank") {
      if (
        !question.expectedAnswer ||
        String(question.expectedAnswer).trim() === ""
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Fill-in-the-blank must have a non-empty expectedAnswer.",
          },
          { status: 400 }
        );
      }
    }

    if (qType === "mcq") {
      type Option = {
        text?: string;
        imageUrl?: string;
        audioUrl?: string;
        [key: string]: unknown;
      };
      const opts: Option[] = Array.isArray(question.options)
        ? question.options
        : [];
      // count only non-empty options (text or image or audio)
      const validOptions = opts.filter((o: Option) =>
        Boolean(
          (o?.text && String(o.text).trim()) || o?.imageUrl || o?.audioUrl
        )
      );
      if (validOptions.length < 2) {
        return NextResponse.json(
          {
            success: false,
            error: "MCQ must have at least 2 options with content.",
          },
          { status: 400 }
        );
      }
      // ensure correctOptionId, if provided, is either a temp-id or a valid uuid (we let SQL handle final mapping)
      if (
        question.correctOptionId &&
        typeof question.correctOptionId !== "string"
      ) {
        return NextResponse.json(
          { success: false, error: "correctOptionId must be a string id." },
          { status: 400 }
        );
      }
    }

    // 2) Call the atomic SQL function via supabaseAdmin RPC
    //    The SQL function should accept (quiz_id uuid, question_data jsonb) and return JSONB
    const rpcResult = await supabaseAdmin.rpc("save_question_atomic", {
      quiz_id: quizId,
      question_data: question,
    });

    if (rpcResult.error) {
      console.error("DB RPC error:", rpcResult.error);
      return NextResponse.json(
        { success: false, error: rpcResult.error.message ?? "Database error" },
        { status: 500 }
      );
    }

    // 3) Success -> return data in a consistent shape
    return NextResponse.json(
      { success: true, data: rpcResult.data },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("save-question route crash:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

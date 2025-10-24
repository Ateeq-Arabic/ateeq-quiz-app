import { NextResponse } from "next/server";
import { supabaseAdmin, ensureAdmin } from "../_utils";

export async function POST(req: Request) {
  const adminCheck = await ensureAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { questionId, newOrder } = await req.json();
    if (!questionId || typeof newOrder !== "number") {
      return NextResponse.json(
        { error: "Missing questionId or newOrder" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("questions")
      .update({ order_index: newOrder })
      .eq("id", questionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

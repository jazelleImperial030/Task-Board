import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data: boards, error } = await supabase
      .from("Board")
      .select("*, Task(*)")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    const result = boards.map((board) => ({
      ...board,
      tasks: board.Task,
      _count: { tasks: board.Task.length },
      Task: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Board name is required" },
        { status: 400 }
      );
    }

    const { data: board, error } = await supabase
      .from("Board")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...board, _count: { tasks: 0 } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}

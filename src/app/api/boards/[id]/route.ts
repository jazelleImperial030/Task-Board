import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: board, error } = await supabase
      .from("Board")
      .select("*, Task(*)")
      .eq("id", id)
      .single();

    if (error || !board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const result = {
      ...board,
      tasks: board.Task.sort((a: { order: number; createdAt: string }, b: { order: number; createdAt: string }) =>
        a.order !== b.order ? a.order - b.order : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      _count: { tasks: board.Task.length },
      Task: undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch board:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Board name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const { data: updated, error } = await supabase
      .from("Board")
      .update(updateData)
      .eq("id", id)
      .select("*, Task(*)")
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const result = {
      ...updated,
      tasks: updated.Task.sort((a: { order: number; createdAt: string }, b: { order: number; createdAt: string }) =>
        a.order !== b.order ? a.order - b.order : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      _count: { tasks: updated.Task.length },
      Task: undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update board:", error);
    return NextResponse.json({ error: "Failed to update board" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete tasks first (cascade)
    await supabase.from("Task").delete().eq("boardId", id);

    const { error } = await supabase
      .from("Board")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Failed to delete board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}

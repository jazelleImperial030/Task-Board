import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tasks } = body as {
      tasks: { id: string; status: string; order: number }[];
    };

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: "tasks array is required" }, { status: 400 });
    }

    // Update each task
    for (const t of tasks) {
      const { error } = await supabase
        .from("Task")
        .update({ status: t.status, order: t.order, updatedAt: new Date().toISOString() })
        .eq("id", t.id);

      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to reorder tasks:", error);
    return NextResponse.json({ error: "Failed to reorder tasks" }, { status: 500 });
  }
}

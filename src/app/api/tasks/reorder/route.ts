import { prisma } from "@/lib/prisma";
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

    await prisma.$transaction(
      tasks.map((t) =>
        prisma.task.update({
          where: { id: t.id },
          data: { status: t.status, order: t.order },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to reorder tasks:", error);
    return NextResponse.json({ error: "Failed to reorder tasks" }, { status: 500 });
  }
}

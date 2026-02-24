import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["todo", "in_progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

export async function GET(request: NextRequest) {
  try {
    const boardId = request.nextUrl.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json(
        { error: "boardId query parameter is required" },
        { status: 400 }
      );
    }

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: { boardId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { boardId, title, description, status, priority, dueDate } = body;

    if (!boardId || typeof boardId !== "string") {
      return NextResponse.json(
        { error: "boardId is required" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { error: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` },
        { status: 400 }
      );
    }

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        boardId,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || "todo",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

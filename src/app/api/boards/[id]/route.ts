import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: [{ order: "asc" }, { createdAt: "desc" }] },
        _count: { select: { tasks: true } },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
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

    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Board name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const updated = await prisma.board.update({
      where: { id },
      data: updateData,
      include: {
        tasks: { orderBy: [{ order: "asc" }, { createdAt: "desc" }] },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(updated);
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
    const board = await prisma.board.findUnique({ where: { id } });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    await prisma.board.delete({ where: { id } });

    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Failed to delete board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}

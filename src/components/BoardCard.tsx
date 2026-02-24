"use client";

import Link from "next/link";
import { Board } from "@/types";

interface BoardCardProps {
  board: Board;
  onDelete: (id: string) => void;
}

export default function BoardCard({ board, onDelete }: BoardCardProps) {
  const taskCount = board._count?.tasks ?? 0;

  return (
    <div className="bg-surface rounded-lg border border-border-custom hover:border-[#484F58] transition-colors group">
      <div
        className="h-0.5 rounded-t-lg"
        style={{ backgroundColor: board.color || "#8B949E" }}
      />
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <Link href={`/board/${board.id}`} className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors truncate">
              {board.name}
            </h3>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(board.id);
            }}
            className="ml-1.5 p-1 text-muted hover:text-red-400 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
            title="Delete board"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {board.description && (
          <p className="text-muted text-[11px] mb-2 line-clamp-2 leading-relaxed">
            {board.description}
          </p>
        )}
        <Link href={`/board/${board.id}`} className="block">
          <div className="flex items-center text-[11px] text-muted">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </div>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { Board } from "@/types";

interface AnalyticsBannerProps {
  boards: Board[];
}

export default function AnalyticsBanner({ boards }: AnalyticsBannerProps) {
  const totalTasks = boards.reduce((sum, b) => sum + (b._count?.tasks ?? 0), 0);

  if (totalTasks === 0) return null;

  return (
    <div className="bg-surface rounded-lg border border-border-custom p-3 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center py-1">
          <p className="text-sm font-semibold text-foreground">{boards.length}</p>
          <p className="text-[10px] text-muted mt-0.5">Boards</p>
        </div>
        <div className="text-center py-1">
          <p className="text-sm font-semibold text-foreground">{totalTasks}</p>
          <p className="text-[10px] text-muted mt-0.5">Total Tasks</p>
        </div>
        <div className="text-center py-1">
          <p className="text-sm font-semibold text-accent">{boards.length}</p>
          <p className="text-[10px] text-muted mt-0.5">Active</p>
        </div>
        <div className="text-center py-1">
          <p className="text-sm font-semibold text-emerald-400">
            {Math.round((totalTasks / Math.max(boards.length, 1)) * 10) / 10}
          </p>
          <p className="text-[10px] text-muted mt-0.5">Avg/Board</p>
        </div>
      </div>
    </div>
  );
}

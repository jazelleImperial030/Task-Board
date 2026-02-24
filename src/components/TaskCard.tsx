"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Task, TaskStatus, TaskPriority, STATUS_LABELS, PRIORITY_LABELS } from "@/types";

interface TaskCardProps {
  task: Task;
  index: number;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onPriorityChange: (id: string, priority: TaskPriority) => void;
  onEdit: (task: Task) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-[#DA3633]/15 text-[#F85149] border-[#DA3633]/25",
  medium: "bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/25",
  low: "bg-[#238636]/15 text-[#3FB950] border-[#238636]/25",
};

const PRIORITY_OPTIONS: TaskPriority[] = ["high", "medium", "low"];
const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "done"];

export default function TaskCard({
  task,
  index,
  onStatusChange,
  onPriorityChange,
  onEdit,
}: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          className={`bg-surface-el rounded-md border border-border-custom p-2.5 hover:border-[#484F58] transition-colors group cursor-pointer ${
            snapshot.isDragging ? "shadow-lg ring-1 ring-accent/30" : ""
          }`}
        >
          <div className="mb-1">
            <h4 className="text-[11px] font-medium text-foreground min-w-0 break-words leading-snug">
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className="text-[10px] text-muted mb-2 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-1.5">
            <label className={`inline-flex items-center gap-1 border rounded px-1 py-px cursor-pointer ${
              PRIORITY_COLORS[task.priority] || "bg-surface text-muted border-border-custom"
            }`}>
              <span className="text-[9px] font-medium">Priority:</span>
              <select
                value={task.priority}
                onChange={(e) => onPriorityChange(task.id, e.target.value as TaskPriority)}
                onMouseDown={(e) => e.stopPropagation()}
                className="text-[9px] font-medium bg-transparent outline-none cursor-pointer appearance-none"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>

            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-[10px] border border-border-custom rounded px-1.5 py-0.5 text-muted bg-surface focus:ring-1 focus:ring-accent outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {task.dueDate && (
            <p className="text-[10px] text-muted mt-1.5 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}

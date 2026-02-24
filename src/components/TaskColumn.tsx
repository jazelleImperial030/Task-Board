"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Task, TaskStatus, TaskPriority, STATUS_LABELS } from "@/types";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onPriorityChange: (id: string, priority: TaskPriority) => void;
  onEdit: (task: Task) => void;
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: "bg-[#8B949E]",
  in_progress: "bg-[#58A6FF]",
  done: "bg-[#3FB950]",
};

export default function TaskColumn({
  status,
  tasks,
  onStatusChange,
  onPriorityChange,
  onEdit,
}: TaskColumnProps) {
  return (
    <div className="flex flex-col bg-surface rounded-lg border border-border-custom p-2.5 min-h-[180px]">
      <div className="flex items-center gap-2 mb-2.5 px-0.5">
        <div className={`w-2 h-2 rounded-full ${COLUMN_COLORS[status]}`} />
        <h3 className="text-[11px] font-semibold text-muted">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-[10px] text-muted bg-surface-el border border-border-custom rounded px-1.5 py-px font-medium ml-auto">
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-1.5 flex-1 rounded-md transition-colors p-0.5 ${
              snapshot.isDraggingOver ? "bg-accent/5" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onStatusChange={onStatusChange}
                onPriorityChange={onPriorityChange}
                onEdit={onEdit}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[10px] text-[#484F58]">No tasks</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

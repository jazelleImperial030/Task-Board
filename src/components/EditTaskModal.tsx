"use client";

import { useState, useEffect } from "react";
import {
  Task,
  TaskStatus,
  TaskPriority,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/types";

interface EditTaskModalProps {
  task: Task | null;
  mode?: "edit" | "create";
  onClose: () => void;
  onSave: (id: string, data: Partial<Task>) => void;
  onCreate?: (data: { title: string; description?: string | null; priority: TaskPriority; status: TaskStatus; dueDate?: string | null }) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function EditTaskModal({
  task,
  mode = "edit",
  onClose,
  onSave,
  onCreate,
  onDelete,
  loading = false,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (mode === "edit" && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
      );
    } else if (mode === "create") {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
    }
    setConfirmDelete(false);
  }, [task, mode]);

  const isOpen = mode === "create" || !!task;
  if (!isOpen) return null;

  const isEdit = mode === "edit" && !!task;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (isEdit) {
      onSave(task!.id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate || null,
      });
    } else if (onCreate) {
      onCreate({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        dueDate: dueDate || null,
      });
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (isEdit && onDelete) {
      onDelete(task!.id);
      onClose();
    }
  };

  const inputClass =
    "w-full px-3 py-2 bg-surface-el border border-border-custom rounded-lg focus:ring-1 focus:ring-accent focus:border-accent outline-none text-xs text-foreground placeholder:text-muted transition-colors";
  const labelClass = "block text-[11px] font-medium text-muted mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl border border-border-custom shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
          <h3 className="text-sm font-semibold text-foreground">
            {isEdit ? "Edit Task" : "Add New Task"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="task-title" className={labelClass}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Task title"
                autoFocus
                required
              />
            </div>

            <div>
              <label htmlFor="task-desc" className={labelClass}>
                Details
              </label>
              <textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Add details about this task..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="task-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className={inputClass}
                >
                  {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="task-priority" className={labelClass}>
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className={inputClass}
                >
                  {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="task-due" className={labelClass}>
                  Due Date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center mt-5 pt-4 border-t border-border-custom">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  confirmDelete
                    ? "text-white bg-[#DA3633] hover:bg-[#F85149]"
                    : "text-[#F85149] hover:bg-[#DA3633]/10"
                }`}
              >
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-muted hover:text-foreground border border-border-custom rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-[#238636] hover:bg-[#2EA043] rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

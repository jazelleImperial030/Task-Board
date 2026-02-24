"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Task,
  TaskStatus,
  TaskPriority,
  SortField,
  SortDirection,
  PRIORITY_ORDER,
  Board,
} from "@/types";
import TaskColumn from "@/components/TaskColumn";
import CreateTaskButton from "@/components/CreateTaskForm";
import EditTaskModal from "@/components/EditTaskModal";
import TaskFilters from "@/components/TaskFilters";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data);
        setTasks(data.tasks || []);
      } else if (res.status === 404) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch board:", error);
    } finally {
      setLoading(false);
    }
  }, [boardId, router]);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 5000);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  const handleCreateTask = async (data: { title: string; description?: string | null; priority: TaskPriority; status: TaskStatus; dueDate?: string | null }) => {
    setCreateLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, boardId }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [newTask, ...prev]);
        setShowCreateTask(false);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setEditTask(null);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      fetchBoard();
    }
  };

  const handlePriorityChange = async (id: string, priority: TaskPriority) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (error) {
      console.error("Failed to update task priority:", error);
      fetchBoard();
    }
  };

  const handleEditSave = async (id: string, data: Partial<Task>) => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        setEditTask(null);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setEditLoading(false);
    }
  };



  const filteredAndSorted = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case "dueDate": {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          cmp = aDate - bDate;
          break;
        }
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "createdAt":
        default:
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, statusFilter, sortField, sortDirection]);

  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const task of filteredAndSorted) {
      groups[task.status]?.push(task);
    }
    return groups;
  }, [filteredAndSorted]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted text-xs">Board not found</p>
      </div>
    );
  }

  const statuses: TaskStatus[] = ["todo", "in_progress", "done"];
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const completionPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      {/* Header */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-[11px] text-muted hover:text-accent mb-2.5 transition-colors"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Boards
        </Link>
        <div className="flex items-center gap-2">
          {board.color && (
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: board.color }}
            />
          )}
          <h1 className="text-sm font-semibold text-foreground">{board.name}</h1>
        </div>
        {board.description && (
          <p className="text-muted mt-0.5 ml-[18px] text-[11px]">{board.description}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 text-[11px]">
        <span className="text-muted">{tasks.length} total</span>
        <span className="text-[#8B949E]">{todoCount} todo</span>
        <span className="text-[#58A6FF]">{inProgressCount} in progress</span>
        <span className="text-[#3FB950]">{doneCount} done</span>
        {tasks.length > 0 && (
          <>
            <div className="flex-1 max-w-[120px] bg-surface-el rounded-full h-1 overflow-hidden">
              <div
                className="bg-[#3FB950] h-1 rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-muted">{completionPct}%</span>
          </>
        )}
      </div>

      {/* Create task + filters */}
      <div className="mb-4 space-y-2">
        <CreateTaskButton onClick={() => setShowCreateTask(true)} />
        <TaskFilters
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
        />
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statuses.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onEdit={setEditTask}
          />
        ))}
      </div>

      <EditTaskModal
        task={editTask}
        mode="edit"
        onClose={() => setEditTask(null)}
        onSave={handleEditSave}
        onDelete={handleDeleteTask}
        loading={editLoading}
      />

      {showCreateTask && (
        <EditTaskModal
          task={null}
          mode="create"
          onClose={() => setShowCreateTask(false)}
          onSave={() => {}}
          onCreate={handleCreateTask}
          loading={createLoading}
        />
      )}
    </div>
  );
}

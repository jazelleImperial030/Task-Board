"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Board,
  Task,
  TaskStatus,
  TaskPriority,
  SortField,
  SortDirection,
  PRIORITY_ORDER,
  STATUS_LABELS,
} from "@/types";
import CreateBoardModal from "@/components/CreateBoardModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import PriorityChart from "@/components/PriorityChart";
import TaskColumn from "@/components/TaskColumn";
import CreateTaskButton from "@/components/CreateTaskForm";
import EditTaskModal from "@/components/EditTaskModal";
import TaskFilters from "@/components/TaskFilters";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

export default function Dashboard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteBoardTarget, setDeleteBoardTarget] = useState<string | null>(null);
  const [deleteBoardLoading, setDeleteBoardLoading] = useState(false);

  // Which view is active: null = dashboard, string = board id
  const [activeBoard, setActiveBoard] = useState<string | null>(null);

  // Board detail state
  const [boardDetail, setBoardDetail] = useState<Board | null>(null);
  const [boardTasks, setBoardTasks] = useState<Task[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [taskCreateLoading, setTaskCreateLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [mobileTab, setMobileTab] = useState<TaskStatus>("todo");

  // Fetch all boards (silent = no loading spinner, used for polling)
  const fetchBoards = useCallback(async (silent = false) => {
    const start = Date.now();
    try {
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      if (!silent) {
        const elapsed = Date.now() - start;
        const remaining = Math.max(600 - elapsed, 0);
        setTimeout(() => setLoading(false), remaining);
      }
    }
  }, []);

  useEffect(() => {
    fetchBoards();
    const interval = setInterval(() => fetchBoards(true), 5000);
    return () => clearInterval(interval);
  }, [fetchBoards]);

  // Fetch single board detail (silent = no loading spinner, used for polling)
  const fetchBoardDetail = useCallback(async (boardId: string, silent = false) => {
    if (!silent) setBoardLoading(true);
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setBoardDetail(data);
        setBoardTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to fetch board:", error);
    } finally {
      if (!silent) setBoardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeBoard) {
      setStatusFilter("all");
      setSortField("createdAt");
      setSortDirection("desc");
      setEditTask(null);
      setShowCreateTask(false);
      fetchBoardDetail(activeBoard);
      const interval = setInterval(() => fetchBoardDetail(activeBoard, true), 5000);
      return () => clearInterval(interval);
    } else {
      setBoardDetail(null);
      setBoardTasks([]);
    }
  }, [activeBoard, fetchBoardDetail]);

  // Board CRUD
  const handleCreateBoard = async (data: {
    name: string;
    description: string;
    color: string;
  }) => {
    setCreateLoading(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newBoard = await res.json();
        setBoards((prev) => [newBoard, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateBoard = async (id: string, data: { name?: string; description?: string }) => {
    try {
      const res = await fetch(`/api/boards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setBoardDetail(updated);
        setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
      }
    } catch (error) {
      console.error("Failed to update board:", error);
    }
  };

  const handleDeleteBoard = async () => {
    if (!deleteBoardTarget) return;
    setDeleteBoardLoading(true);
    try {
      const res = await fetch(`/api/boards/${deleteBoardTarget}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBoards((prev) => prev.filter((b) => b.id !== deleteBoardTarget));
        if (activeBoard === deleteBoardTarget) setActiveBoard(null);
        setDeleteBoardTarget(null);
      }
    } catch (error) {
      console.error("Failed to delete board:", error);
    } finally {
      setDeleteBoardLoading(false);
    }
  };

  // Task CRUD (board detail)
  const handleCreateTask = async (data: { title: string; description?: string | null; priority: TaskPriority; status: TaskStatus; dueDate?: string | null }) => {
    if (!activeBoard) return;
    setTaskCreateLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, boardId: activeBoard }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setBoardTasks((prev) => [newTask, ...prev]);
        setShowCreateTask(false);
        // Update sidebar count
        setBoards((prev) =>
          prev.map((b) =>
            b.id === activeBoard
              ? { ...b, _count: { tasks: (b._count?.tasks ?? 0) + 1 }, tasks: [...(b.tasks ?? []), newTask] }
              : b
          )
        );
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setTaskCreateLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    setBoardTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBoardTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      if (activeBoard) fetchBoardDetail(activeBoard);
    }
  };

  const handlePriorityChange = async (id: string, priority: TaskPriority) => {
    setBoardTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBoardTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (error) {
      console.error("Failed to update task priority:", error);
      if (activeBoard) fetchBoardDetail(activeBoard);
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
        setBoardTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        setEditTask(null);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBoardTasks((prev) => prev.filter((t) => t.id !== id));
        setEditTask(null);
        setBoards((prev) =>
          prev.map((b) =>
            b.id === activeBoard
              ? { ...b, _count: { tasks: Math.max((b._count?.tasks ?? 1) - 1, 0) } }
              : b
          )
        );
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Drag and drop handler
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const srcStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      // Build column arrays from current boardTasks (respecting order)
      const columns: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
      for (const t of [...boardTasks].sort((a, b) => a.order - b.order)) {
        columns[t.status]?.push(t);
      }

      // Remove from source
      const [moved] = columns[srcStatus].splice(source.index, 1);
      if (!moved) return;
      moved.status = destStatus;

      // Insert into destination
      columns[destStatus].splice(destination.index, 0, moved);

      // Assign new order values and flatten
      const updated: Task[] = [];
      const reorderPayload: { id: string; status: string; order: number }[] = [];
      for (const status of ["todo", "in_progress", "done"] as TaskStatus[]) {
        columns[status].forEach((task, i) => {
          const newTask = { ...task, order: i, status: task === moved ? destStatus : task.status };
          updated.push(newTask);
          reorderPayload.push({ id: task.id, status: newTask.status, order: i });
        });
      }

      setBoardTasks(updated);

      // Persist to server
      fetch("/api/tasks/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: reorderPayload }),
      }).catch((err) => console.error("Failed to persist reorder:", err));
    },
    [boardTasks]
  );

  // Filtered/sorted tasks for board view
  const filteredAndSorted = useMemo(() => {
    let result = [...boardTasks];
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
          cmp = a.order - b.order;
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return result;
  }, [boardTasks, statusFilter, sortField, sortDirection]);

  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of filteredAndSorted) {
      groups[task.status]?.push(task);
    }
    return groups;
  }, [filteredAndSorted]);

  // Export functions (per board)
  const exportBoardJSON = () => {
    if (!boardDetail) return;
    const data = JSON.stringify({ ...boardDetail, tasks: boardTasks }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${boardDetail.name.replace(/\s+/g, "-").toLowerCase()}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBoardCSV = () => {
    if (!boardDetail) return;
    const rows: string[] = ["Task,Description,Status,Priority,Due Date,Created At"];
    for (const task of boardTasks) {
      rows.push(
        [
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || "").replace(/"/g, '""')}"`,
          task.status,
          task.priority,
          task.dueDate || "",
          task.createdAt,
        ].join(",")
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${boardDetail.name.replace(/\s+/g, "-").toLowerCase()}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Dashboard aggregates
  const allTasks: Task[] = boards.flatMap((b) => b.tasks ?? []);
  const highCount = allTasks.filter((t) => t.priority === "high").length;
  const mediumCount = allTasks.filter((t) => t.priority === "medium").length;
  const lowCount = allTasks.filter((t) => t.priority === "low").length;
  const todoCount = allTasks.filter((t) => t.status === "todo").length;
  const inProgressCount = allTasks.filter((t) => t.status === "in_progress").length;
  const doneCount = allTasks.filter((t) => t.status === "done").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-surface border-r border-border-custom flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-border-custom">
          <h2 className="text-sm font-semibold text-foreground">Boards</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 text-muted hover:text-accent rounded transition-colors"
            title="New board"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setActiveBoard(null)}
          className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeBoard === null
              ? "text-accent"
              : "text-muted hover:text-foreground"
          }`}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </button>

        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Board tiles */}
          {boards.length === 0 ? (
            <p className="text-muted text-xs px-1 py-3">No boards yet. Create one to get started.</p>
          ) : (
            boards.map((board, index) => (
              <div
                key={board.id}
                onClick={() => setActiveBoard(board.id)}
                className={`group relative w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                  activeBoard === board.id
                    ? "bg-[#1a1d23] border-[#3d444d]"
                    : "bg-[#161b22] hover:bg-[#1a1d23] border-border-custom"
                }`}
              >
                <p className="text-xs font-medium text-foreground truncate pr-5">{board.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-muted">
                    {board._count?.tasks ?? 0} {(board._count?.tasks ?? 0) === 1 ? "task" : "tasks"}
                  </p>
                  <p className="text-[10px] text-muted">Board {index + 1}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteBoardTarget(board.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-0.5 text-muted hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete board"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeBoard === null ? (
          /* ── Dashboard View ── */
          <>
            <h1 className="text-base font-semibold text-foreground mb-5">Dashboard</h1>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
              <MetricCard label="Total Tasks" value={allTasks.length} color="#8B949E" />
              <StatusCard label="To Do" value={todoCount} icon="circle" />
              <StatusCard label="In Progress" value={inProgressCount} icon="clock" />
              <StatusCard label="Done" value={doneCount} icon="check" />
              <div className="bg-surface rounded-lg border border-border-custom p-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-surface-el">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {allTasks.length > 0 ? Math.round((doneCount / allTasks.length) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-muted">Completed</p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <PriorityChart high={highCount} medium={mediumCount} low={lowCount} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard label="High" value={highCount} color="#F85149" />
              <MetricCard label="Medium" value={mediumCount} color="#D29922" />
              <MetricCard label="Low" value={lowCount} color="#3FB950" />
            </div>
          </>
        ) : boardLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
          </div>
        ) : boardDetail ? (
          /* ── Board Detail View ── */
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {boardDetail.color && (
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: boardDetail.color }}
                    />
                  )}
                  <EditableText
                    value={boardDetail.name}
                    onSave={(val) => handleUpdateBoard(boardDetail.id, { name: val })}
                    className="text-[15px] font-semibold text-foreground"
                    inputClassName="text-[15px] font-semibold text-foreground bg-surface-el border border-border-custom rounded px-1 -ml-1 outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="ml-[18px] mt-0.5">
                  <EditableText
                    value={boardDetail.description || ""}
                    placeholder="Add a description..."
                    onSave={(val) => handleUpdateBoard(boardDetail.id, { description: val })}
                    className="text-muted text-[11px]"
                    inputClassName="text-[11px] text-muted bg-surface-el border border-border-custom rounded px-1 -ml-1 outline-none focus:ring-1 focus:ring-accent w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportBoardJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-muted hover:text-foreground bg-surface border border-border-custom rounded-md hover:bg-surface-el transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  JSON
                </button>
                <button
                  onClick={exportBoardCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-muted hover:text-foreground bg-surface border border-border-custom rounded-md hover:bg-surface-el transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <CreateTaskButton onClick={() => setShowCreateTask(true)} />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-4 text-[11px]">
              <span className="text-muted">{boardTasks.length} total</span>
              <span className="text-[#8B949E]">
                {boardTasks.filter((t) => t.status === "todo").length} todo
              </span>
              <span className="text-[#58A6FF]">
                {boardTasks.filter((t) => t.status === "in_progress").length} in progress
              </span>
              <span className="text-[#3FB950]">
                {boardTasks.filter((t) => t.status === "done").length} done
              </span>
              {boardTasks.length > 0 && (() => {
                const pct = Math.round(
                  (boardTasks.filter((t) => t.status === "done").length / boardTasks.length) * 100
                );
                return (
                  <>
                    <div className="flex-1 max-w-[120px] bg-surface-el rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-[#3FB950] h-1 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-muted">{pct}%</span>
                  </>
                );
              })()}
            </div>

            {/* Filters */}
            <div className="mb-4">
              <TaskFilters
                sortField={sortField}
                onSortFieldChange={setSortField}
                sortDirection={sortDirection}
                onSortDirectionChange={setSortDirection}
              />
            </div>

            {/* Kanban columns — desktop: 3-col grid, mobile: tabs */}
            <DragDropContext onDragEnd={handleDragEnd}>
              {/* Mobile tabs */}
              <div className="md:hidden">
                <div className="flex border-b border-border-custom mb-3">
                  {(["todo", "in_progress", "done"] as TaskStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setMobileTab(s)}
                      className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
                        mobileTab === s
                          ? "text-accent border-b-2 border-accent"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                      <span className="ml-1.5 text-[10px] opacity-60">
                        {tasksByStatus[s].length}
                      </span>
                    </button>
                  ))}
                </div>
                <TaskColumn
                  status={mobileTab}
                  tasks={tasksByStatus[mobileTab]}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onEdit={setEditTask}
                />
              </div>

              {/* Desktop grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-3">
                {(["todo", "in_progress", "done"] as TaskStatus[]).map((status) => (
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
            </DragDropContext>

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
                loading={taskCreateLoading}
              />
            )}
          </>
        ) : null}
      </main>

      {/* Board modals */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBoard}
        loading={createLoading}
      />
      <DeleteConfirmDialog
        isOpen={!!deleteBoardTarget}
        title="Delete Board"
        message="Are you sure you want to delete this board? All tasks in this board will also be deleted."
        onConfirm={handleDeleteBoard}
        onCancel={() => setDeleteBoardTarget(null)}
        loading={deleteBoardLoading}
      />
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border-custom p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function StatusCard({ label, value, icon }: { label: string; value: number; icon: "circle" | "clock" | "check" }) {
  return (
    <div className="bg-surface rounded-lg border border-border-custom p-3 flex items-center gap-3">
      <div className="p-2 rounded-md bg-surface-el">
        {icon === "circle" && (
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
          </svg>
        )}
        {icon === "clock" && (
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === "check" && (
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}

function EditableText({
  value,
  placeholder,
  onSave,
  className,
  inputClassName,
}: {
  value: string;
  placeholder?: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className={inputClassName}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:opacity-75 transition-opacity ${className}`}
      title="Click to edit"
    >
      {value || <span className="italic text-muted">{placeholder}</span>}
    </span>
  );
}

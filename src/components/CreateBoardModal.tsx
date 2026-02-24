"use client";

import { useState } from "react";
import { BOARD_COLORS } from "@/types";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; color: string }) => void;
  loading?: boolean;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onCreate,
  loading = false,
}: CreateBoardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(BOARD_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), color });
    setName("");
    setDescription("");
    setColor(BOARD_COLORS[0]);
  };

  const inputClass =
    "w-full px-2.5 py-1.5 bg-background border border-border-custom rounded-md focus:ring-1 focus:ring-accent focus:border-accent outline-none text-xs text-foreground placeholder:text-muted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-surface rounded-lg border border-border-custom shadow-2xl p-4 w-full max-w-sm mx-4">
        <h3 className="text-xs font-semibold text-foreground mb-3">
          Create New Board
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="board-name" className="block text-[11px] font-medium text-muted mb-1">
                Name *
              </label>
              <input
                id="board-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Board name"
                className={inputClass}
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="board-desc" className="block text-[11px] font-medium text-muted mb-1">
                Description
              </label>
              <textarea
                id="board-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted mb-1.5">
                Color
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {BOARD_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      color === c ? "border-foreground scale-110" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-2.5 py-1.5 text-[11px] font-medium text-muted hover:text-foreground bg-surface-el border border-border-custom rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#238636] hover:bg-[#2EA043] rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-surface rounded-lg border border-border-custom shadow-2xl p-4 w-full max-w-sm mx-4">
        <h3 className="text-xs font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-muted text-[11px] mb-4 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-2.5 py-1.5 text-[11px] font-medium text-muted hover:text-foreground bg-surface-el border border-border-custom rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#DA3633] hover:bg-[#F85149] rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

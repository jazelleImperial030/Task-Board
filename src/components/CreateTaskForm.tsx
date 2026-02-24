"use client";

interface CreateTaskButtonProps {
  onClick: () => void;
}

export default function CreateTaskButton({ onClick }: CreateTaskButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#238636] hover:bg-[#2EA043] rounded-md transition-colors flex items-center gap-1.5"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add New Task
    </button>
  );
}

"use client";

import {
  SortField,
  SortDirection,
} from "@/types";

interface TaskFiltersProps {
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (dir: SortDirection) => void;
}

const SORT_FIELDS: Record<SortField, string> = {
  createdAt: "Date Created",
  priority: "Priority",
  dueDate: "Due Date",
  title: "Title",
};

export default function TaskFilters({
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
}: TaskFiltersProps) {
  const selectClass =
    "px-2 py-1 bg-surface border border-border-custom rounded-md text-[11px] text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none";

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="sort-field" className="text-[10px] font-medium text-[#484F58]">
        Sort:
      </label>
      <select
        id="sort-field"
        value={sortField}
        onChange={(e) => onSortFieldChange(e.target.value as SortField)}
        className={selectClass}
      >
        {(Object.keys(SORT_FIELDS) as SortField[]).map((f) => (
          <option key={f} value={f}>
            {SORT_FIELDS[f]}
          </option>
        ))}
      </select>
      <button
        onClick={() =>
          onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
        }
        className="flex items-center gap-1 px-2 py-1 border border-border-custom rounded-md hover:bg-surface-el transition-colors bg-surface text-[11px] text-muted"
      >
        <svg
          className={`w-3 h-3 transition-transform ${
            sortDirection === "desc" ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        {sortDirection === "asc" ? "Ascending" : "Descending"}
      </button>
    </div>
  );
}

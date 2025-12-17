import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Button } from "../../ui/button";

export const SubtasksTab = ({
  subtasks = [],
  onToggle,
  onAdd,
  onRemove,
  canEdit = true,
}) => {
  const [newSubtask, setNewSubtask] = useState("");

  const handleAdd = () => {
    if (newSubtask.trim()) {
      onAdd?.(newSubtask.trim());
      setNewSubtask("");
    }
  };

  const completedCount = subtasks.filter(
    (st) => st.is_completed || st.completed
  ).length;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      {subtasks.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">
            {completedCount} of {subtasks.length} completed
          </span>
          <span className="text-neutral-500 dark:text-neutral-500">
            {subtasks.length > 0
              ? Math.round((completedCount / subtasks.length) * 100)
              : 0}
            %
          </span>
        </div>
      )}

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{
              width: `${
                subtasks.length > 0
                  ? (completedCount / subtasks.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      )}

      {/* Subtasks list */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="group flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm transition-all"
          >
            <button
              onClick={() => onToggle?.(subtask.id)}
              disabled={!canEdit}
              className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                subtask.is_completed || subtask.completed
                  ? "bg-primary-500 border-primary-500"
                  : "border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-400"
              }`}
            >
              {(subtask.is_completed || subtask.completed) && (
                <Check className="h-3 w-3 text-white" />
              )}
            </button>
            <span
              className={`flex-1 text-sm ${
                subtask.is_completed || subtask.completed
                  ? "line-through text-neutral-400 dark:text-neutral-500"
                  : "text-neutral-900 dark:text-neutral-200"
              }`}
            >
              {subtask.title || subtask.text}
            </span>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove?.(subtask.id)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-500 dark:text-neutral-500 dark:hover:text-error-400 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {subtasks.length === 0 && (
        <div className="py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
          No subtasks yet. Add one below to break down this task.
        </div>
      )}

      {/* Add new subtask */}
      {canEdit && (
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="Add a subtask..."
            className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
          <Button
            onClick={handleAdd}
            disabled={!newSubtask.trim()}
            size="sm"
            className="px-4 h-9 bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
};

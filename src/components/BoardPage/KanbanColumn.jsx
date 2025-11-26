import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { KanbanCard } from "./KanbanCard.jsx";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import { useBoard } from "../../context/BoardContext";

export const KanbanColumn = ({ id, title, ideas, onOpenTask, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });
  const { updateColumn, deleteColumn } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== title) {
      await updateColumn(id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the "${title}" column? All cards in this column will be deleted.`)) {
      await deleteColumn(id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col max-h-full bg-primary-100 dark:bg-neutral-900 rounded-2xl p-2 kanban-column relative">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 mb-3 pt-1 flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 tracking-tight bg-white dark:bg-neutral-800 px-2 py-1 rounded border border-primary-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
              autoFocus
            />
          ) : (
            <>
              <h2 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 tracking-tight truncate">
                {title}
              </h2>
              <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 text-[10px] font-semibold text-neutral-500 dark:text-neutral-300">
                {ideas.length}
              </span>
            </>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename column
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Droppable Area Container with Masks */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* Top Gradient Mask */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-primary-100 to-transparent dark:from-neutral-900 z-10 pointer-events-none rounded-t-xl" />

        {/* Scrollable List */}
        <div
          ref={setNodeRef}
          className={`flex-1 overflow-y-auto px-0.5 pb-2 custom-scrollbar ${
            isOver ? "bg-neutral-200/30 dark:bg-neutral-800/30 rounded-xl" : ""
          }`}
        >
          <SortableContext
            items={ideas.map((idea) => idea.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1 pt-2 pb-2">
              {ideas.map((idea) => (
                <KanbanCard
                  key={idea.id}
                  idea={idea}
                  onClick={() => onOpenTask(idea.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Bottom Gradient Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-primary-100 to-transparent dark:from-neutral-900 z-10 pointer-events-none rounded-b-xl" />
      </div>

      {/* Add Task Button - Sticky at bottom */}
      <div className="flex-shrink-0 pt-2 relative z-20">
        <Button
          variant="ghost"
          onClick={() => onAddTask(id)}
          className="w-full justify-start text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-white/50 dark:hover:bg-neutral-800/50 h-9 text-sm font-medium rounded-xl transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add task
        </Button>
      </div>
    </div>
  );
};

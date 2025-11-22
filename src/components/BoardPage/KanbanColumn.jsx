import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import { KanbanCard } from "./KanbanCard.jsx";
import { Button } from "../ui/button";

export const KanbanColumn = ({ id, title, ideas, onOpenTask, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col max-h-full bg-primary-100 dark:bg-neutral-900 rounded-2xl p-2 kanban-column relative">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 mb-3 pt-1 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h2 className="font-semibold text-sm text-neutral-800 tracking-tight">
            {title}
          </h2>
          <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-neutral-200/60 text-[10px] font-semibold text-neutral-500">
            {ideas.length}
          </span>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600 p-1 hover:bg-neutral-200/50 rounded-md transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Area Container with Masks */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* Top Gradient Mask */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-primary-100 to-transparent dark:from-neutral-900 z-10 pointer-events-none rounded-t-xl" />

        {/* Scrollable List */}
        <div
          ref={setNodeRef}
          className={`flex-1 overflow-y-auto px-0.5 pb-2 custom-scrollbar ${
            isOver ? "bg-neutral-200/30 rounded-xl" : ""
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
          className="w-full justify-start text-neutral-500 hover:text-neutral-800 hover:bg-white/50 h-9 text-sm font-medium rounded-xl transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add task
        </Button>
      </div>
    </div>
  );
};

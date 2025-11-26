import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal } from "react-dom";
import { KanbanCard, KanbanCardContent } from "./KanbanCard.jsx";
import { KanbanColumn } from "./KanbanColumn.jsx";
import { useBoard } from "../../context/BoardContext";
import { toast } from "sonner";

export const KanbanBoard = ({
  ideas,
  columns = [],
  onMoveCard,
  onOpenTask,
  onAddTask,
  onReorderIdeas,
  canEdit,
}) => {
  const [activeId, setActiveId] = useState(null);
  const { createColumn, currentBoard } = useBoard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    if (!canEdit) return;
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the active and over ideas
    const activeIdea = ideas.find((i) => i.id === activeId);
    const overIdea = ideas.find((i) => i.id === overId);

    if (!activeIdea) return;

    // Check if over is a column
    const isOverColumn = columns.some((col) => col.id === overId);
    
    if (isOverColumn) {
      // Dragging over a column - just move to that column
      if (activeIdea.kanbanStatus !== columns.find(c => c.id === overId)?.title) {
        onMoveCard(activeId, overId); // Pass column ID
      }
    } else if (overIdea) {
      // Dragging over another card
      const activeStatus = activeIdea.kanbanStatus || "Backlog";
      const overStatus = overIdea.kanbanStatus || "Backlog";

      if (activeStatus === overStatus) {
        // Same column - reorder
        const oldIndex = ideas.findIndex((i) => i.id === activeId);
        const newIndex = ideas.findIndex((i) => i.id === overId);

        if (oldIndex !== newIndex && onReorderIdeas) {
          const reorderedIdeas = arrayMove(ideas, oldIndex, newIndex);
          onReorderIdeas(() => reorderedIdeas);
        }
      } else {
        // Different column - move to the over card's column
        const targetColumn = columns.find(c => c.title === overStatus);
        if (targetColumn) {
           onMoveCard(activeId, targetColumn.id);
        }
      }
    }
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
  };

  const handleAddList = async () => {
    console.log("handleAddList");
    
    if (!canEdit || !currentBoard) return;
    const title = window.prompt("Enter list title:");
    if (!title) return;

    try {
      const position = columns.length > 0 
        ? Math.max(...columns.map(c => c.position)) + 1000 
        : 0;
      await createColumn(currentBoard.id, title, position);
      toast.success("List added");
    } catch (error) {
      // Error handled in context
    }
  };

  // Group ideas by status (column title)
  const ideasByColumnId = {};
  columns.forEach(col => {
    ideasByColumnId[col.id] = ideas.filter(idea => idea.kanbanStatus === col.title);
  });

  const activeIdea = activeId ? ideas.find((i) => i.id === activeId) : null;

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden bg-white dark:bg-neutral-950 px-6 pb-2 pt-4 mb-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-2 items-start">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              ideas={ideasByColumnId[column.id] || []}
              onOpenTask={onOpenTask}
              onAddTask={() => onAddTask(column.title)} // Pass title as status for now
            />
          ))}

          {/* Add another list button */}
          <div className="flex-shrink-0 w-[280px]">
            <button 
              onClick={handleAddList}
              className="w-full h-12 rounded-xl border border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              + Add another list
            </button>
          </div>
        </div>

        {createPortal(
          <DragOverlay>
            {activeIdea ? <KanbanCardContent idea={activeIdea} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

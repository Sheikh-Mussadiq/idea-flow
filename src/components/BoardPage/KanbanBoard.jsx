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

const columns = [
  { id: "Backlog", title: "To do" },
  { id: "In Progress", title: "Doing" },
  { id: "Review", title: "Review" },
  { id: "Done", title: "Done" },
];

export const KanbanBoard = ({
  ideas,
  onMoveCard,
  onOpenTask,
  onAddTask,
  onReorderIdeas,
  canEdit,
}) => {
  const [activeId, setActiveId] = useState(null);

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
      if (activeIdea.kanbanStatus !== overId) {
        onMoveCard(activeId, overId);
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
        onMoveCard(activeId, overStatus);
      }
    }
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
  };

  const ideasByStatus = {
    Backlog: [],
    "In Progress": [],
    Review: [],
    Done: [],
  };

  // Only show ideas that have been explicitly assigned to Kanban (have a kanbanStatus)
  ideas.forEach((idea) => {
    if (idea.kanbanStatus && ideasByStatus[idea.kanbanStatus]) {
      ideasByStatus[idea.kanbanStatus].push(idea);
    }
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
        <div className="flex h-full gap-2">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              ideas={ideasByStatus[column.id]}
              onOpenTask={onOpenTask}
              onAddTask={onAddTask}
            />
          ))}

          {/* Add another list placeholder */}
          <div className="flex-shrink-0 w-[280px]">
            <button className="w-full h-12 rounded-xl border border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
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

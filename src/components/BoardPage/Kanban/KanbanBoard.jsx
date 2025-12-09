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
import { useBoard } from "../../../context/BoardContext";
import { toast } from "sonner";

export const KanbanBoard = ({
  cards,
  columns = [],
  onMoveCard,
  onOpenTask,
  onAddCard,
  onReorderCards,
  canEdit,
  availableTags,
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
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active card
    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Find over column (either directly or via card)
    const overColumn =
      columns.find((c) => c.id === overId) ||
      columns.find(
        (c) =>
          c.title === cards.find((card) => card.id === overId)?.kanbanStatus
      );

    if (!overColumn) return;

    const activeColumnTitle = activeCard.kanbanStatus;
    const overColumnTitle = overColumn.title;

    if (activeColumnTitle !== overColumnTitle) {
      const activeIndex = cards.findIndex((c) => c.id === activeId);
      const overIndex = cards.findIndex((c) => c.id === overId);

      onReorderCards((prev) => {
        const newCards = [...prev];
        // Update status
        const updatedCard = {
          ...newCards[activeIndex],
          kanbanStatus: overColumnTitle,
        };

        // Remove from old pos
        newCards.splice(activeIndex, 1);

        // Insert at new pos
        if (columns.some((c) => c.id === overId)) {
          // Dropped on column background -> append
          newCards.push(updatedCard);
        } else {
          // Dropped on a card
          let insertIndex = overIndex;
          if (activeIndex < overIndex) insertIndex--; // Adjust for removal
          if (insertIndex < 0) insertIndex = 0;
          newCards.splice(insertIndex, 0, updatedCard);
        }
        return newCards;
      });
    } else {
      // Same column
      if (columns.some((c) => c.id === overId)) return; // Over same column bg, do nothing

      const activeIndex = cards.findIndex((c) => c.id === activeId);
      const overIndex = cards.findIndex((c) => c.id === overId);

      if (activeIndex !== overIndex) {
        onReorderCards((prev) => arrayMove(prev, activeIndex, overIndex));
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const currentCard = cards.find((c) => c.id === activeId);
    if (!currentCard) return;

    const column = columns.find((c) => c.title === currentCard.kanbanStatus);
    if (!column) return;

    const columnCards = cards.filter((c) => c.kanbanStatus === column.title);
    const newIndex = columnCards.findIndex((c) => c.id === activeId);

    if (newIndex !== -1) {
      onMoveCard(activeId, column.id, newIndex);
    }
  };

  const handleAddList = async () => {
    console.log("handleAddList");

    if (!canEdit || !currentBoard) return;
    const title = window.prompt("Enter list title:");
    if (!title) return;

    try {
      const position =
        columns.length > 0
          ? Math.max(...columns.map((c) => c.position)) + 1
          : 1;
      await createColumn(currentBoard.id, title, position);
      toast.success("List added");
    } catch (error) {
      // Error handled in context
    }
  };

  // Group cards by status (column title)
  const cardsByColumnId = {};
  columns.forEach((col) => {
    cardsByColumnId[col.id] = cards.filter(
      (card) => card.kanbanStatus === col.title
    );
  });

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

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
              cards={cardsByColumnId[column.id] || []}
              onOpenTask={onOpenTask}
              onAddCard={() => onAddCard(column.id)}
              availableTags={availableTags}
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
            {activeCard ? <KanbanCardContent card={activeCard} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

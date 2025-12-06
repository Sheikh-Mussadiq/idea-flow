import {
  Plus,
  Calendar,
  MessageSquare,
  MoreVertical,
  GripVertical,
  Link as LinkIcon,
  User as UserIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useState, useMemo } from "react";
import { useBoard } from "../../../context/BoardContext";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

// Sortable Task Item Component
const SortableTaskItem = ({
  task,
  onOpenTask,
  getStatusColor,
  getPriorityColor,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 rounded-xl p-3 opacity-50 h-[60px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      id={task.id}
      style={style}
      {...attributes}
      onClick={() => onOpenTask(task.id)}
      className="group relative bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 rounded-xl p-3 hover:shadow-card-hover hover:border-neutral-300/80 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer flex items-center gap-4"
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 cursor-grab active:cursor-grabbing transition-opacity hover:text-neutral-600 dark:hover:text-neutral-400 flex-shrink-0"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Priority Dot */}
      <div
        className={`h-2 w-2 rounded-full shrink-0 ${getPriorityColor(
          task.priority
        )}`}
      />

      {/* Title */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
          {task.title}
        </span>
        {task.hasAttachments && (
          <LinkIcon className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 rotate-45" />
        )}
      </div>

      {/* Metadata Section */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Comments */}
        <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {task.comments?.length || 0} comments
          </span>
        </div>

        {/* Assignee */}
        <div className="flex items-center">
          {task.assignedTo ? (
            <div className="flex -space-x-2">
              <Avatar className="h-6 w-6 border-2 border-white dark:border-neutral-800 ring-1 ring-neutral-100 dark:ring-neutral-700">
                <AvatarImage src={task.assignedTo.avatarUrl} />
                <AvatarFallback className="text-[9px] bg-primary-50 text-primary-600 font-bold">
                  {task.assignedTo.avatar}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center">
              <UserIcon className="h-3 w-3 text-neutral-400" />
            </div>
          )}
        </div>

        {/* Status Badge (Pill) */}
        <div
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusColor(
            task.kanbanStatus
          )}`}
        >
          {task.kanbanStatus}
        </div>

        {/* Actions Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Droppable List Column Component (consistent with KanbanColumn)
const ListColumn = ({
  column,
  cards,
  onAddCard,
  onOpenTask,
  getStatusColor,
  getPriorityColor,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id, // Use column.id like KanbanColumn
  });

  return (
    <div className="space-y-3 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-2xl">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {column.title}
          </h3>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddCard(column.title)}
          className="h-6 text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <Plus className="h-3 w-3 mr-1.5" />
          Add task
        </Button>
      </div>

      {/* Cards List */}
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[50px] rounded-xl transition-colors ${
          isOver
            ? "bg-neutral-100/50 dark:bg-neutral-800/50 ring-2 ring-primary-100 dark:ring-primary-900"
            : ""
        }`}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.length === 0 ? (
            <div className="px-4 py-8 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 bg-white/50 dark:bg-neutral-800/50">
              <p className="text-sm">No tasks in {column.title}</p>
            </div>
          ) : (
            cards.map((card) => (
              <SortableTaskItem
                key={card.id}
                task={card}
                onOpenTask={onOpenTask}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export const ListView = ({
  cards = [],
  columns = [],
  onAddCard,
  onOpenTask,
  onMoveCard,
  onReorderCards,
}) => {
  const { currentBoard, updateCard } = useBoard();
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [activeDragWidth, setActiveDragWidth] = useState(null);

  // Use cards from currentBoard for real-time updates, fallback to prop
  const boardCards = currentBoard?.cards || cards;
  const boardColumns = currentBoard?.columns || columns;

  // Group cards by column ID (consistent with KanbanColumn)
  const cardsByColumnId = useMemo(() => {
    const groups = {};

    // Initialize groups based on actual columns
    boardColumns.forEach((column) => {
      groups[column.id] = [];
    });

    // Group cards by their column_id
    boardCards.forEach((card) => {
      if (groups[card.column_id] !== undefined) {
        groups[card.column_id].push(card);
      }
    });

    // Sort cards by position within each column
    Object.keys(groups).forEach((columnId) => {
      groups[columnId].sort((a, b) => (a.position || 0) - (b.position || 0));
    });

    return groups;
  }, [boardCards, boardColumns]);

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "bg-neutral-200 text-neutral-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Review":
        return "bg-purple-100 text-purple-700";
      case "Done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      default:
        return "bg-neutral-300";
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    if (event.active.data.current?.type === "Task") {
      setActiveDragItem(event.active.data.current.task);
      // Capture width of the dragged element
      const el = document.getElementById(event.active.id);
      if (el) {
        setActiveDragWidth(el.getBoundingClientRect().width);
      }
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active card
    const activeCard = boardCards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Find over column (either directly or via card)
    const overColumn =
      boardColumns.find((c) => c.id === overId) ||
      boardColumns.find(
        (c) => c.id === boardCards.find((card) => card.id === overId)?.column_id
      );

    if (!overColumn) return;

    const activeColumnId = activeCard.column_id;
    const overColumnId = overColumn.id;

    if (activeColumnId !== overColumnId) {
      const activeIndex = boardCards.findIndex((c) => c.id === activeId);
      const overIndex = boardCards.findIndex((c) => c.id === overId);

      onReorderCards((prev) => {
        const newCards = [...prev];
        // Update column_id and kanbanStatus
        const updatedCard = {
          ...newCards[activeIndex],
          column_id: overColumnId,
          kanbanStatus: overColumn.title,
        };

        // Remove from old pos
        newCards.splice(activeIndex, 1);

        // Insert at new pos
        if (boardColumns.some((c) => c.id === overId)) {
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
      if (boardColumns.some((c) => c.id === overId)) return; // Over same column bg, do nothing

      const activeIndex = boardCards.findIndex((c) => c.id === activeId);
      const overIndex = boardCards.findIndex((c) => c.id === overId);

      if (activeIndex !== overIndex) {
        onReorderCards((prev) => arrayMove(prev, activeIndex, overIndex));
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    setActiveDragWidth(null);

    if (!over) return;

    const activeId = active.id;
    const currentCard = boardCards.find((c) => c.id === activeId);
    if (!currentCard) return;

    const column = boardColumns.find((c) => c.id === currentCard.column_id);
    if (!column) return;

    const columnCards = boardCards.filter((c) => c.column_id === column.id);
    const newIndex = columnCards.findIndex((c) => c.id === activeId);

    if (newIndex !== -1) {
      onMoveCard(activeId, column.id, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full w-full bg-white dark:bg-neutral-950 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
          {boardColumns.map((column) => (
            <ListColumn
              key={column.id}
              column={column}
              cards={cardsByColumnId[column.id] || []}
              onAddCard={onAddCard}
              onOpenTask={onOpenTask}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        {createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.5" } },
              }),
            }}
          >
            {activeDragItem && (
              <div
                style={{
                  width: activeDragWidth ? `${activeDragWidth}px` : "auto",
                }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 rounded-xl p-3 shadow-2xl flex items-center gap-4 rotate-2 cursor-grabbing"
              >
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${getPriorityColor(
                    activeDragItem.priority
                  )}`}
                />
                <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate flex-1">
                  {activeDragItem.title}
                </span>
                <div
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusColor(
                    activeDragItem.kanbanStatus
                  )}`}
                >
                  {activeDragItem.kanbanStatus}
                </div>
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </div>
    </DndContext>
  );
};

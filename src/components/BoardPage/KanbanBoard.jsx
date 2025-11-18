import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const isOverdue = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
};

const columns = [
  { id: "Backlog", title: "Backlog" },
  { id: "In Progress", title: "In Progress" },
  { id: "Review", title: "Review" },
  { id: "Done", title: "Done" },
];

export const KanbanBoard = ({
  ideas,
  onOpenComments,
  onMoveCard,
  onViewInFlow,
  teamMembers,
  onAssign,
  onOpenTask,
  canEdit,
}) => {
  const handleDragEnd = (result) => {
    if (!canEdit) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    onMoveCard(draggableId, newStatus);
  };

  const ideasByStatus = {
    Backlog: [],
    "In Progress": [],
    Review: [],
    Done: [],
  };

  ideas.forEach((idea) => {
    if (idea.kanbanStatus) {
      ideasByStatus[idea.kanbanStatus].push(idea);
    }
  });

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto px-2 py-2">
      <DragDropContext onDragEnd={handleDragEnd}>
        {columns.map((column) => {
          const columnIdeas = ideasByStatus[column.id];

          return (
            <div
              key={column.id}
              className="flex-1 min-w-[260px] max-w-[320px] flex flex-col bg-neutral-100/60 rounded-2xl p-3 border border-neutral-200/60 shadow-inner"
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-sm font-semibold text-neutral-900">
                  {column.title}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white text-neutral-500 border border-neutral-200/70">
                  {columnIdeas.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2 rounded-xl p-1 overflow-y-auto transition-colors ${
                      snapshot.isDraggingOver ? "bg-white/70" : "bg-white/40"
                    }`}
                  >
                    {columnIdeas.map((idea, index) => (
                      <Draggable
                        key={idea.id}
                        draggableId={idea.id}
                        index={index}
                        isDragDisabled={!canEdit}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`bg-white rounded-xl p-3 shadow-md border border-neutral-200/60 transition-shadow duration-200 cursor-pointer hover:shadow-xl ${
                              dragSnapshot.isDragging ? "scale-[1.02]" : ""
                            }`}
                            onClick={() => onOpenTask(idea.id)}
                          >
                            {(() => {
                              const completed = idea.subtasks.filter(
                                (st) => st.completed
                              ).length;
                              return (
                                <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-500">
                                  <div className="flex items-center gap-2">
                                    {idea.priority && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-neutral-100">
                                        <span
                                          className={`h-2 w-2 rounded-full ${
                                            idea.priority === "low"
                                              ? "bg-success-500"
                                              : idea.priority === "medium"
                                              ? "bg-warning-500"
                                              : "bg-error-500"
                                          }`}
                                        />
                                        <span className="capitalize">
                                          {idea.priority}
                                        </span>
                                      </span>
                                    )}
                                    {idea.dueDate && (
                                      <span
                                        className={`px-2 py-0.5 rounded-full bg-neutral-100 ${
                                          isOverdue(idea.dueDate) &&
                                          "text-error-500"
                                        }`}
                                      >
                                        {idea.dueDate}
                                      </span>
                                    )}
                                  </div>
                                  {completed}/{idea.subtasks.length} ✓
                                </div>
                              );
                            })()}
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                                {idea.title}
                              </h4>
                              <Badge
                                variant={
                                  idea.type === "ai" ? "default" : "secondary"
                                }
                                className="text-[10px] px-1.5 py-0.5"
                              >
                                {idea.type === "ai" ? "AI" : "Manual"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-neutral-500">
                                  Assigned to:
                                </span>
                                {idea.assignedTo ? (
                                  <div className="flex items-center gap-1">
                                    <div className="h-5 w-5 rounded-full bg-primary-500/10 text-[10px] flex items-center justify-center text-primary-500 font-medium">
                                      {idea.assignedTo.avatar}
                                    </div>
                                    <span className="text-[11px] text-neutral-900 line-clamp-1 max-w-[120px]">
                                      {idea.assignedTo.name}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-neutral-500 italic">
                                    Unassigned
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-neutral-600 line-clamp-3 mb-2">
                              {idea.description}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-neutral-600 hover:text-primary-500 hover:bg-neutral-100 px-1"
                                onClick={() => onOpenComments(idea.id)}
                              >
                                Open Comments
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[11px] text-neutral-600 hover:text-primary-500 hover:bg-neutral-100 px-1"
                                onClick={() => onViewInFlow(idea.id)}
                              >
                                View in Flow
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
};

import { Plus, Calendar, MessageSquare, MoreVertical, GripVertical, Link as LinkIcon, User as UserIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useMemo, useState } from "react";
import { useBoard } from "../../context/BoardContext";
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
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

// Sortable Task Item Component
const SortableTaskItem = ({ task, onOpenTask, getStatusColor, getPriorityColor }) => {
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
      {...listeners}
      onClick={() => onOpenTask(task.id)}
      className="group relative bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 rounded-xl p-3 hover:shadow-card-hover hover:border-neutral-300/80 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer flex items-center gap-4"
    >
      {/* Drag Handle */}
      <div className="opacity-0 group-hover:opacity-100 text-neutral-300 dark:text-neutral-600 cursor-grab active:cursor-grabbing transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Priority Dot */}
      <div className={`h-2 w-2 rounded-full shrink-0 ${getPriorityColor(task.priority)}`} />

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
        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusColor(task.kanbanStatus)}`}>
          {task.kanbanStatus}
        </div>

        {/* Actions Menu */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Droppable Status Group Component
const StatusGroup = ({ status, tasks, onAddTask, onOpenTask, getStatusColor, getPriorityColor }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "Column",
      status,
    },
  });

  return (
    <div className="space-y-3 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-2xl">
      {/* Group Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{status}</h3>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 px-2 py-1 rounded-full">{tasks.length}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAddTask(status)}
          className="h-6 text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <Plus className="h-3 w-3 mr-1.5" />
          Add task
        </Button>
      </div>

      {/* Tasks List */}
      <div 
        ref={setNodeRef}
        className={`space-y-2 min-h-[50px] rounded-xl transition-colors ${isOver ? 'bg-neutral-100/50 dark:bg-neutral-800/50 ring-2 ring-primary-100 dark:ring-primary-900' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
             <div className="px-4 py-8 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 bg-white/50 dark:bg-neutral-800/50">
                <p className="text-sm">No tasks in {status}</p>
             </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskItem 
                key={task.id} 
                task={task} 
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

export const ListView = ({ onAddTask, onOpenTask }) => {
  const { activeBoard, updateBoard } = useBoard();
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [activeDragWidth, setActiveDragWidth] = useState(null);

  const ideas = useMemo(() => activeBoard?.ideas || [], [activeBoard]);

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups = {
      "To Do": [],
      "In Progress": [],
      "Review": [],
      "Done": []
    };

    ideas.forEach(idea => {
      if (idea.kanbanStatus && groups[idea.kanbanStatus]) {
        groups[idea.kanbanStatus].push(idea);
      } else if (idea.kanbanStatus) {
        if (!groups[idea.kanbanStatus]) {
          groups[idea.kanbanStatus] = [];
        }
        groups[idea.kanbanStatus].push(idea);
      }
    });

    return groups;
  }, [ideas]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-neutral-200 text-neutral-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Review': return 'bg-purple-100 text-purple-700';
      case 'Done': return 'bg-green-100 text-green-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      default: return 'bg-neutral-300';
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

  const handleDragEnd = (event) => {
    setActiveDragItem(null);
    setActiveDragWidth(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active task
    const activeTask = ideas.find(i => i.id === activeId);
    if (!activeTask) return;

    // Determine the target status
    let targetStatus = null;

    // If dropped over a column (status group)
    if (over.data.current?.type === "Column") {
      targetStatus = over.data.current.status;
    } 
    // If dropped over another task
    else if (over.data.current?.type === "Task") {
      const overTask = ideas.find(i => i.id === overId);
      if (overTask) {
        targetStatus = overTask.kanbanStatus;
      }
    }

    if (!targetStatus) return;

    // Case 1: Moving to a different status
    if (targetStatus !== activeTask.kanbanStatus) {
      const updatedIdeas = ideas.map(idea => {
        if (idea.id === activeId) {
          return { ...idea, kanbanStatus: targetStatus };
        }
        return idea;
      });

      updateBoard(activeBoard.id, { ideas: updatedIdeas });
    }
    // Case 2: Reordering within the same status
    else if (activeId !== overId) {
      // Get all tasks with the same status
      const tasksInStatus = ideas.filter(i => i.kanbanStatus === targetStatus);
      const activeIndex = tasksInStatus.findIndex(t => t.id === activeId);
      const overIndex = tasksInStatus.findIndex(t => t.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Reorder tasks within the status
        const reorderedTasks = arrayMove(tasksInStatus, activeIndex, overIndex);
        
        // Merge back with other tasks
        const otherTasks = ideas.filter(i => i.kanbanStatus !== targetStatus);
        const updatedIdeas = [...otherTasks, ...reorderedTasks];

        updateBoard(activeBoard.id, { ideas: updatedIdeas });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full w-full bg-white dark:bg-neutral-950 flex flex-col overflow-hidden">

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
          {Object.entries(groupedTasks).map(([status, tasks]) => (
            <StatusGroup
              key={status}
              status={status}
              tasks={tasks}
              onAddTask={onAddTask}
              onOpenTask={onOpenTask}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        {createPortal(
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
            {activeDragItem && (
              <div 
                style={{ width: activeDragWidth ? `${activeDragWidth}px` : 'auto' }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 rounded-xl p-3 shadow-2xl flex items-center gap-4 rotate-2 cursor-grabbing"
              >
                 <div className={`h-2 w-2 rounded-full shrink-0 ${getPriorityColor(activeDragItem.priority)}`} />
                 <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate flex-1">
                    {activeDragItem.title}
                 </span>
                 <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusColor(activeDragItem.kanbanStatus)}`}>
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

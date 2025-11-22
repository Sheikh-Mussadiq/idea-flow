import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, Paperclip, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const KanbanCardContent = memo(({ idea, onClick, style, className, ...props }) => {
  return (
    <div
      style={style}
      onClick={onClick}
      className={`group relative bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] hover:border-neutral-300/80 dark:hover:border-neutral-600/80 transition-all duration-200 cursor-pointer touch-none ${className}`}
      {...props}
    >
      {/* Image / Cover */}
      {idea.coverImage && (
        <div className="mb-3 rounded-lg overflow-hidden h-32 w-full relative group-hover:opacity-95 transition-opacity">
          <img
            src={idea.coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header: Priority & Labels */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {idea.priority && (
          <span
            className={`h-1.5 w-8 rounded-full ${
              idea.priority.toLowerCase() === "high"
                ? "bg-red-400"
                : idea.priority.toLowerCase() === "medium"
                ? "bg-orange-400"
                : "bg-blue-400"
            }`}
          />
        )}
        {idea.labels?.map((label, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide"
            style={{
              backgroundColor: label.color + "15",
              color: label.color,
            }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100 leading-snug group-hover:text-primary-600 dark:group-hover:text-white transition-colors">
          {idea.title}
        </h3>
        <button className="opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Description Preview */}
      {idea.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
          {idea.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-1">
        <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500">
          {(idea.commentsCount > 0 ||
            (idea.comments && Object.keys(idea.comments).length > 0)) && (
            <div className="flex items-center gap-1 text-xs font-medium hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                {idea.commentsCount ||
                  (idea.comments ? Object.keys(idea.comments).length : 0)}
              </span>
            </div>
          )}
          {idea.attachments?.length > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{idea.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        <div className="flex -space-x-2">
          {idea.assignedTo ? (
            <Avatar className="h-6 w-6 border-[1.5px] border-white dark:border-neutral-900 ring-1 ring-neutral-100 dark:ring-neutral-700">
              <AvatarFallback className="text-[9px] bg-primary-50 dark:bg-neutral-700 text-primary-600 dark:text-neutral-200 font-semibold">
                {idea.assignedTo.avatar || idea.assignedTo.name[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            idea.members?.map((member, i) => (
              <Avatar
                key={i}
                className="h-6 w-6 border-[1.5px] border-white dark:border-neutral-900 ring-1 ring-neutral-100 dark:ring-neutral-700"
              >
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback className="text-[9px] bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 font-semibold">
                  {member.name[0]}
                </AvatarFallback>
              </Avatar>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

export const KanbanCard = memo(({ idea, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: idea.id,
    data: {
      type: "Idea",
      idea,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 border border-dashed border-neutral-300 dark:border-neutral-600 h-[100px]"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCardContent idea={idea} onClick={onClick} />
    </div>
  );
});


import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, Paperclip, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

// Helper to strip HTML tags for preview text
const stripHtml = (html) => {
  if (!html) return "";
  // Create a temporary element to parse HTML and extract text
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
};

export const KanbanCardContent = memo(
  ({ card, onClick, style, className, ...props }) => {
    return (
      <div
        style={style}
        onClick={onClick}
        className={`group relative bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] hover:border-neutral-300/80 dark:hover:border-neutral-600/80 transition-all duration-200 cursor-pointer touch-none ${className}`}
        {...props}
      >
        {/* Image / Cover */}
        {card.coverImage && (
          <div className="mb-3 rounded-lg overflow-hidden h-32 w-full relative group-hover:opacity-95 transition-opacity">
            <img
              src={card.coverImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Header: Priority & Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {card.priority && (
            <span
              className={`h-1.5 w-8 rounded-full ${
                card.priority.toLowerCase() === "high"
                  ? "bg-red-400"
                  : card.priority.toLowerCase() === "medium"
                  ? "bg-orange-400"
                  : "bg-blue-400"
              }`}
            />
          )}
          {(card.tags || []).map((tag, i) => {
            // Handle both tag objects and tag IDs
            const tagObj = typeof tag === "object" ? tag : null;
            if (!tagObj) return null;
            return (
              <span
                key={tagObj.id || i}
                className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide"
                style={{
                  backgroundColor: (tagObj.color || "#6366f1") + "15",
                  color: tagObj.color || "#6366f1",
                }}
              >
                {tagObj.name}
              </span>
            );
          })}
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100 leading-snug group-hover:text-primary-600 dark:group-hover:text-white transition-colors">
            {card.title}
          </h3>
          <button className="opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Description Preview */}
        {card.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
            {stripHtml(card.description)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-1">
          <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500">
            {(card.commentsCount > 0 ||
              (card.comments && Object.keys(card.comments).length > 0)) && (
              <div className="flex items-center gap-1 text-xs font-medium hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>
                  {card.commentsCount ||
                    (card.comments ? Object.keys(card.comments).length : 0)}
                </span>
              </div>
            )}
            {card.attachments?.length > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{card.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Assignees */}
          <div className="flex -space-x-2">
            {card.assignees && card.assignees.length > 0 ? (
              card.assignees.slice(0, 3).map((assignee, i) => {
                const assigneeId = assignee.id || assignee.user?.id;
                const assigneeName =
                  assignee.full_name ||
                  assignee.user?.full_name ||
                  assignee.name ||
                  assignee.user?.email ||
                  "?";
                const assigneeAvatar =
                  assignee.avatar_url || assignee.user?.avatar_url;
                return (
                  <Avatar
                    key={assigneeId || i}
                    className="h-6 w-6 border-[1.5px] border-white dark:border-neutral-900 ring-1 ring-neutral-100 dark:ring-neutral-700"
                  >
                    <AvatarImage src={assigneeAvatar} />
                    <AvatarFallback className="text-[9px] bg-primary-50 dark:bg-neutral-700 text-primary-600 dark:text-neutral-200 font-semibold">
                      {assigneeName?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                );
              })
            ) : card.assignedTo ? (
              <Avatar className="h-6 w-6 border-[1.5px] border-white dark:border-neutral-900 ring-1 ring-neutral-100 dark:ring-neutral-700">
                <AvatarImage
                  src={
                    card.assignedTo.avatar_url ||
                    card.assignedTo.user?.avatar_url
                  }
                />
                <AvatarFallback className="text-[9px] bg-primary-50 dark:bg-neutral-700 text-primary-600 dark:text-neutral-200 font-semibold">
                  {(
                    card.assignedTo.full_name ||
                    card.assignedTo.user?.full_name ||
                    card.assignedTo.name
                  )?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

export const KanbanCard = memo(({ card, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
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
      <KanbanCardContent card={card} onClick={onClick} />
    </div>
  );
});

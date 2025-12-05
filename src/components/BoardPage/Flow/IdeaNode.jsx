import { memo } from "react";
import { Handle, Position } from "reactflow";
import { MessageCircle, Inbox, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { cn } from "../../../lib/utils";

export const IdeaNode = memo(({ data }) => {
  // Get comment count and commenters
  const commentCount = data.comments?.length || 0;
  const hasUnreadComments = data.hasUnreadComments || false;

  // Get unique commenters (limit to 3 for display)
  const commenters = data.commenters || [];
  const displayCommenters = commenters.slice(0, 3);

  return (
    <div
      onClick={() => data.onOpenTask?.(data.id)}
      className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-[320px] border border-neutral-200/60 dark:border-neutral-700/60 animate-fade-in"
    >
      {/* Top Handle for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary-500 !w-3 !h-3"
      />

      {/* Badge */}
      <Badge
        variant={data.type === "ai" ? "default" : "secondary"}
        className="absolute -top-3 left-6 shadow-sm"
      >
        {data.type === "ai" ? "AI" : "Manual"}
      </Badge>

      {/* Comment Indicator - Top Right */}
      {commentCount > 0 && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenComments?.(data.id);
          }}
          className="absolute -top-2 -right-2 flex items-center gap-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-lg border border-neutral-200/60 dark:border-neutral-700/60 px-2 py-1.5 hover:shadow-xl transition-all cursor-pointer group/comment"
        >
          {/* Unread Indicator Dot */}
          {hasUnreadComments && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full border-2 border-white animate-pulse" />
          )}

          {/* Avatar Stack */}
          <div className="flex -space-x-2">
            {displayCommenters.map((commenter, index) => (
              <Avatar
                key={index}
                className="h-6 w-6 border-2 border-white dark:border-neutral-900 ring-1 ring-neutral-100 dark:ring-neutral-700"
              >
                <AvatarImage src={commenter.avatar_url} />
                <AvatarFallback className="text-[9px] bg-primary-50 dark:bg-neutral-700 text-primary-600 dark:text-neutral-200 font-semibold">
                  {commenter.name?.[0] || commenter.avatar || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {commenters.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                <span className="text-[9px] font-semibold text-neutral-600 dark:text-neutral-300">
                  +{commenters.length - 3}
                </span>
              </div>
            )}
          </div>

          {/* Comment Icon and Count */}
          <div className="flex items-center gap-1 pl-1">
            {/* <MessageCircle className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400 group-hover/comment:text-primary-500 dark:group-hover/comment:text-white transition-colors" /> */}
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 group-hover/comment:text-primary-600 dark:group-hover/comment:text-white">
              {commentCount}
            </span>
          </div>
        </div>
      )}

      {/* Empty state comment button when no comments */}
      {commentCount === 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenComments?.(data.id);
          }}
          className="absolute -top-2 -right-2 h-8 w-8 bg-white dark:bg-neutral-800 rounded-full shadow-md border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all flex items-center justify-center group/comment"
        >
          <MessageCircle className="h-5 w-5 text-neutral-400 dark:text-neutral-500 group-hover/comment:text-primary-500 dark:group-hover/comment:text-white transition-colors" />
        </button>
      )}

      {/* Content */}
      <div className="space-y-3 mt-2">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white leading-snug pr-8">
          {data.title}
        </h3>
        {data.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Assigned:</span>
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 rounded-full bg-primary-500/10 text-[10px] flex items-center justify-center text-primary-500 font-medium">
                {data.assignedTo.avatar}
              </div>
              <span className="max-w-[140px] truncate text-neutral-900/90 dark:text-neutral-100/90">
                {data.assignedTo.name}
              </span>
            </div>
          </div>
        )}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
          {data.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-700/60">
        {/* Like/Dislike buttons - Only for AI ideas */}
        {data.type === "ai" && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
                data.is_liked &&
                  "text-success-500 bg-success-500/30 dark:bg-success-500/20",
                !data.is_liked && "text-neutral-600 dark:text-neutral-400",
                data.onToggleLike &&
                  !data.is_liked &&
                  "hover:text-success-500 hover:bg-success-500/30 dark:hover:bg-success-500/10",
                data.onToggleLike &&
                  data.is_liked &&
                  "hover:text-success-500 hover:bg-success-500/50 dark:hover:bg-success-500/30",
                !data.onToggleLike &&
                  "cursor-not-allowed pointer-events-none opacity-70"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (data.onToggleLike) {
                  data.onToggleLike(data.id);
                }
              }}
              title={
                data.onToggleLike
                  ? "Like this idea"
                  : "Only the board owner can like ideas"
              }
            >
              <ThumbsUp
                className={cn("h-3.5 w-3.5", data.is_liked && "fill-current")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
                data.is_disliked &&
                  "text-error-500 bg-error-500/30 dark:bg-error-900/20",
                !data.is_disliked && "text-neutral-600 dark:text-neutral-400",
                data.onToggleDislike &&
                  !data.is_disliked &&
                  "hover:text-error-500 dark:hover:text-white hover:bg-error-500/30 dark:hover:bg-error-900/20",
                data.onToggleDislike &&
                  data.is_disliked &&
                  "hover:text-error-500 hover:bg-error-500/50 dark:hover:bg-error-900/30",
                !data.onToggleDislike &&
                  "cursor-not-allowed pointer-events-none opacity-70"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (data.onToggleDislike) {
                  data.onToggleDislike(data.id);
                }
              }}
              title={
                data.onToggleDislike
                  ? "Dislike this idea"
                  : "Only the board owner can dislike ideas"
              }
            >
              <ThumbsDown
                className={cn(
                  "h-3.5 w-3.5",
                  data.is_disliked && "fill-current"
                )}
              />
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-auto">
          {data.onSendToKanban && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={(e) => {
                e.stopPropagation();
                data.onSendToKanban?.(data.id);
              }}
            >
              <Inbox className="h-3.5 w-3.5" />
            </Button>
          )}

          {data.onAddSubIdea && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                data.onAddSubIdea?.(data.id);
              }}
              className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs"
            >
              Sub-idea
            </Button>
          )}

          {data.type === "manual" && data.onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(data.id);
              }}
              className="text-neutral-600 dark:text-neutral-400 hover:text-error-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Bottom handle for outgoing connections to sub-ideas - only show if has sub-ideas */}
      {data.hasSubIdeas && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-primary-900 !w-3 !h-3"
        />
      )}
    </div>
  );
});

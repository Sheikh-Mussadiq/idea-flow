import { X, Send, ThumbsUp, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useState } from "react";

export const CommentPanel = ({
  isOpen,
  onClose,
  ideaTitle,
  assignedTo,
  comments,
  onAddComment,
  canComment,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canComment) return;
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[440px] bg-white shadow-xl z-50 animate-slide-in-right flex flex-col border-l border-neutral-200/60">
        {/* Header */}
        <div className="p-8 border-b border-neutral-200/60 flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-semibold text-neutral-900">
              {ideaTitle}
            </h2>
            {assignedTo && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Assigned to:</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 border border-neutral-200/60">
                    <AvatarFallback className="bg-primary-500/10 text-primary-500 text-xs font-medium">
                      {assignedTo.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-neutral-900 line-clamp-1 max-w-[180px]">
                    {assignedTo.name}
                  </span>
                </div>
              </div>
            )}
            {!assignedTo && (
              <p className="text-xs text-neutral-500">
                Assigned to: Unassigned
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-neutral-100 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-neutral-200">
                  <AvatarFallback className="bg-primary-500/10 text-primary-500 text-sm font-medium">
                    {comment.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-neutral-900">
                      {comment.author}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-800 leading-relaxed">
                    {comment.text}
                  </p>
                  {comment.reactions && (
                    <div className="flex items-center gap-4 pt-1">
                      <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-500 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.reactions.thumbsUp}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-error-500 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>{comment.reactions.heart}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-8 border-t border-neutral-200/60 bg-neutral-100/40"
        >
          <div className="flex gap-3">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 h-12 rounded-xl bg-white border-neutral-200/60"
              disabled={!canComment}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!canComment || !newComment.trim()}
              className="h-12 w-12 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

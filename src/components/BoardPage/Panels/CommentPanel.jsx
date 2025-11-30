import { X, Send, Trash2, Edit2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { useState } from "react";
import { useNotifications } from "../../../context/NotificationsContext";
import { useAuth } from "../../../context/AuthContext";

export const CommentPanel = ({
  isOpen,
  onClose,
  ideaTitle,
  ideaId,
  assignedTo,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  canComment,
}) => {
  const { addNotification } = useNotifications();
  const { authUser } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canComment) return;
    if (newComment.trim()) {
      try {
        await onAddComment(newComment);

        // Trigger notifications
        if (newComment.includes("@")) {
          // Mention notification
          addNotification({
            userId: "current-user",
            message: `You were mentioned in a comment on '${ideaTitle}'`,
            type: "mention",
            taskId: ideaId,
          });
        } else {
          // General comment notification
          addNotification({
            userId: "current-user",
            message: `New comment on '${ideaTitle}'`,
            type: "activity",
            taskId: ideaId,
          });
        }

        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await onUpdateComment(commentId, editText);
      setEditingCommentId(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
          {comments.length === 0 ? (
            <div className="text-center text-neutral-500 text-sm py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner = authUser?.id === comment.user_id;
              const userFullName = comment.user?.full_name || "Unknown User";
              const userInitials = userFullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 ring-2 ring-neutral-200">
                      <AvatarFallback className="bg-primary-500/10 text-primary-500 text-sm font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900">
                            {userFullName}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatTimestamp(comment.created_at)}
                          </span>
                        </div>
                        {isOwner && canComment && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleStartEdit(comment)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-error-500 hover:text-error-600"
                              onClick={() => handleDelete(comment.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(comment.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-800 leading-relaxed">
                          {comment.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
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

import { X, Send, Trash2, Edit2, MessageCircle, Check } from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useState, useRef, useEffect } from "react";
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
  const { currentUser } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  // Get current user initials and avatar
  const currentUserInitials =
    currentUser?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "ME";

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
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
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
        className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-white dark:bg-neutral-950 shadow-2xl z-50 flex flex-col border-l border-neutral-200 dark:border-neutral-800 transition-transform">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary-900 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                {ideaTitle}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                No comments yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Start the conversation
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {comments.map((comment, index) => {
                const isOwner = currentUser?.id === comment.user_id;
                const userFullName = comment.user?.full_name || "Unknown User";
                const userAvatar = comment.user?.avatar_url;
                const userInitials = userFullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const isLastComment = index === comments.length - 1;

                return (
                  <div
                    key={comment.id}
                    className={`group py-3 ${
                      !isLastComment
                        ? "border-b border-neutral-100 dark:border-neutral-800/50"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700">
                        <AvatarImage src={userAvatar} />
                        <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                              {userFullName}
                            </span>
                            {isOwner && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                            {formatTimestamp(comment.created_at)}
                          </span>
                        </div>

                        {/* Comment Text or Edit Mode */}
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full text-sm min-h-[60px] resize-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(comment.id)}
                                className="h-7 text-xs px-3 bg-primary-900 hover:bg-primary-800"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-7 text-xs px-3"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
                            {comment.text}
                          </p>
                        )}

                        {/* Actions - Show on hover */}
                        {isOwner &&
                          canComment &&
                          editingCommentId !== comment.id && (
                            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleStartEdit(comment)}
                                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                              >
                                Edit
                              </button>
                              <span className="text-neutral-300 dark:text-neutral-600">
                                •
                              </span>
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-xs text-neutral-400 hover:text-error-500 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
          <form onSubmit={handleSubmit}>
            <div className="flex items-start gap-3">
              {/* Current User Avatar */}
              <div className="flex-shrink-0 pt-1">
                <Avatar className="h-9 w-9 border-2 border-white dark:border-neutral-800 shadow-sm">
                  {currentUser?.avatar_url ? (
                    <AvatarImage
                      src={currentUser.avatar_url}
                      alt={currentUser?.full_name}
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary-900 text-white text-xs font-semibold">
                    {currentUserInitials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Input Container */}
              <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 focus-within:border-primary-400 dark:focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Add a comment..."
                  className="w-full min-h-[44px] max-h-[100px] py-3 px-4 text-sm resize-none bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-white"
                  disabled={!canComment}
                  rows={1}
                />

                {/* Actions Row */}
                <div className="flex items-center justify-between px-3 pb-2">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    ↵ to send
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!canComment || !newComment.trim()}
                    className="h-7 px-3 rounded-lg bg-primary-900 hover:bg-primary-800 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 text-xs font-medium gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

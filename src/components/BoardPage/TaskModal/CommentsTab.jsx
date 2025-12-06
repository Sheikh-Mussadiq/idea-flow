import { useState } from "react";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { CommentToolbar } from "./CommentToolbar";
import { MoreVertical, Heart } from "lucide-react";

export const CommentsTab = ({
  comments = [],
  onAdd,
  onUpdate,
  onDelete,
  canEdit = true,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Transform comments to have the fields we need
  const transformedComments = comments.map((comment) => ({
    ...comment,
    author: comment.user?.full_name || comment.author || "Unknown",
    avatar: comment.user?.avatar_url
      ? comment.user.avatar_url[0]
      : comment.avatar || "U",
    timestamp: comment.created_at
      ? new Date(comment.created_at).toLocaleDateString()
      : comment.timestamp || "Just now",
  }));

  const handleAdd = () => {
    if (newComment.trim()) {
      onAdd?.(newComment.trim());
      setNewComment("");
    }
  };

  // Show empty state if no comments
  if (transformedComments.length === 0 && !newComment) {
    return (
      <div className="space-y-4">
        <div className="py-8 text-center text-neutral-500 text-sm">
          No comments yet. Be the first to comment!
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button
              onClick={handleAdd}
              disabled={!newComment.trim()}
              size="sm"
              className="px-4 h-9 bg-primary-500 hover:bg-primary-600 text-white"
            >
              Comment
            </Button>
          </div>
        )}
      </div>
    );
  }

  const handleUpdate = (id) => {
    if (editText.trim()) {
      onUpdate?.(id, editText.trim());
      setEditingId(null);
      setEditText("");
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text || comment.content || "");
  };

  return (
    <div className="space-y-4">
      {/* Comments list */}
      <div className="space-y-4">
        {transformedComments.map((comment) => (
          <div
            key={comment.id}
            className="group flex items-start gap-3 p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
          >
            <Avatar className="h-8 w-8 border border-neutral-200 flex-shrink-0">
              <AvatarFallback className="bg-primary-500/10 text-primary-500 text-xs font-medium">
                {comment.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900">
                    {comment.author}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {comment.timestamp}
                  </span>
                </div>
                {canEdit && (
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-100 rounded transition-opacity">
                    <MoreVertical className="h-4 w-4 text-neutral-400" />
                  </button>
                )}
              </div>
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleUpdate(comment.id)}
                      size="sm"
                      className="h-7 px-3 text-xs bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="flex items-center gap-1 text-xs text-neutral-500 hover:text-error-500 transition-colors">
                      <Heart className="h-3.5 w-3.5" />
                      <span>2</span>
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-xs text-neutral-500 hover:text-primary-500 transition-colors"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-xs text-neutral-500 hover:text-primary-500 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete?.(comment.id)}
                          className="text-xs text-neutral-500 hover:text-error-500 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {comments.length === 0 && (
        <div className="py-8 text-center text-neutral-500 text-sm">
          No comments yet. Start the conversation below.
        </div>
      )}

      {/* Add new comment */}
      {canEdit && (
        <div className="border border-neutral-200 rounded-lg bg-white">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 text-sm focus:outline-none resize-none rounded-t-lg"
            rows={3}
          />
          <CommentToolbar
            onAskAI={() => console.log("Ask AI")}
            disabled={!canEdit}
          />
          <div className="px-4 py-3 flex items-center justify-end gap-2 border-t border-neutral-200">
            <Button
              onClick={handleAdd}
              disabled={!newComment.trim()}
              size="sm"
              className="px-4 h-8 bg-primary-500 hover:bg-primary-600 text-white text-sm"
            >
              Publish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

import { X, Send, ThumbsUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  reactions?: { thumbsUp: number; heart: number };
}

interface CommentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ideaTitle: string;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

export const CommentPanel = ({
  isOpen,
  onClose,
  ideaTitle,
  comments,
  onAddComment,
}: CommentPanelProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[440px] bg-card shadow-float z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground pr-4">{ideaTitle}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-muted">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {comment.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {comment.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {comment.text}
                  </p>
                  {comment.reactions && (
                    <div className="flex items-center gap-4 pt-1">
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.reactions.thumbsUp}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
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
        <form onSubmit={handleSubmit} className="p-8 border-t border-border/50 bg-muted/20">
          <div className="flex gap-3">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 h-12 rounded-xl bg-background border-border/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim()}
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

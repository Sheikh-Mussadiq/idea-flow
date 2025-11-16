import { useEffect, useState } from "react";
import { X, Paperclip, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: {
    id: string;
    title: string;
    description: string;
    assignedTo?: { id: string; name: string; avatar: string };
    dueDate?: string;
    priority: "low" | "medium" | "high" | null;
    subtasks: { id: string; text: string; completed: boolean }[];
    attachments: {
      id: string;
      type: "image" | "file" | "video" | "link";
      name: string;
      url: string;
    }[];
    labels: {
      id: string;
      name: string;
      color: string;
    }[];
    activity: { id: string; timestamp: number; user: string; action: string }[];
  } | null;
  teamMembers: { id: string; name: string; avatar: string }[];
  onAssign: (
    id: string,
    member: { id: string; name: string; avatar: string } | null
  ) => void;
  onChangeDueDate: (id: string, date: string | null) => void;
  onChangePriority: (
    id: string,
    priority: "low" | "medium" | "high" | null
  ) => void;
  onAddSubtask: (id: string, text: string) => void;
  onToggleSubtask: (id: string, subtaskId: string) => void;
  onRemoveSubtask: (id: string, subtaskId: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onAddAttachment: (
    id: string,
    attachment: {
      id: string;
      type: "image" | "file" | "video" | "link";
      name: string;
      url: string;
    }
  ) => void;
  onRemoveAttachment: (id: string, attachmentId: string) => void;
  onAddLabel: (
    id: string,
    label: { id: string; name: string; color: string }
  ) => void;
  onRemoveLabel: (id: string, labelId: string) => void;
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
  }[];
  onAddCommentToIdea: (id: string, text: string) => void;
  onDeleteComment: (ideaId: string, commentId: string) => void;
  onUpdateComment: (ideaId: string, commentId: string, text: string) => void;
}

export const TaskModal = ({
  isOpen,
  onClose,
  idea,
  teamMembers,
  onAssign,
  onChangeDueDate,
  onChangePriority,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onUpdateTitle,
  onUpdateDescription,
  onAddAttachment,
  onRemoveAttachment,
  onAddLabel,
  onRemoveLabel,
  comments,
  onAddCommentToIdea,
  onDeleteComment,
  onUpdateComment,
}: TaskModalProps) => {
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (idea) {
      setLocalTitle(idea.title);
      setLocalDescription(idea.description);
      setNewSubtask("");
      setAssignOpen(false);
      setNewLink("");
      setNewComment("");
    }
  }, [idea]);

  if (!isOpen || !idea) return null;

  const handleSaveTitle = () => {
    const trimmed = localTitle.trim();
    if (trimmed && trimmed !== idea.title) {
      onUpdateTitle(idea.id, trimmed);
    }
  };

  const handleSaveDescription = () => {
    const trimmed = localDescription.trim();
    if (trimmed !== idea.description) {
      onUpdateDescription(idea.id, trimmed);
    }
  };

  const completedCount = idea.subtasks.filter((st) => st.completed).length;

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <div
          className="relative w-full max-w-3xl max-h-full bg-card rounded-2xl shadow-float border border-border/70 animate-slide-up overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 border-b border-border/60 bg-card/80">
            <div className="space-y-2 flex-1 pr-4">
              <input
                className="w-full bg-transparent text-xl font-semibold text-foreground outline-none border-none"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleSaveTitle}
                placeholder="Task title"
              />
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {idea.assignedTo && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 border border-border/60">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {idea.assignedTo.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span>{idea.assignedTo.name}</span>
                  </div>
                )}
                {typeof idea.priority === "string" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/80">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        idea.priority === "low"
                          ? "bg-emerald-500"
                          : idea.priority === "medium"
                          ? "bg-amber-400"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="capitalize">{idea.priority}</span>
                  </span>
                )}
                {idea.dueDate && (
                  <span className="px-2 py-0.5 rounded-full bg-muted/80">
                    Due {idea.dueDate}
                  </span>
                )}
                {idea.subtasks.length > 0 && (
                  <span>
                    {completedCount}/{idea.subtasks.length} subtasks ✓
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col md:flex-row h-full max-h-[70vh]">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Description
                </label>
                <textarea
                  className="w-full min-h-[96px] rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none resize-y"
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  placeholder="Add more details, notes, or context..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Subtasks
                  </span>
                  {idea.subtasks.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {completedCount}/{idea.subtasks.length} completed
                    </span>
                  )}
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {idea.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => onToggleSubtask(idea.id, subtask.id)}
                      />
                      <span
                        className={`flex-1 truncate ${
                          subtask.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {subtask.text}
                      </span>
                      <button
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSubtask(idea.id, subtask.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 h-8 rounded-lg bg-muted/60 border border-border/60 px-2 text-xs"
                    placeholder="Add subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onAddSubtask(idea.id, newSubtask);
                        setNewSubtask("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => {
                      onAddSubtask(idea.id, newSubtask);
                      setNewSubtask("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                  <span>Attachments</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <input
                    type="file"
                    multiple
                    className="text-[11px]"
                    onChange={(e) => {
                      if (!idea) return;
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach((file) => {
                        const id = `${Date.now()}-${file.name}`;
                        const url = URL.createObjectURL(file);
                        const type: "image" | "file" | "video" =
                          file.type.startsWith("image/")
                            ? "image"
                            : file.type.startsWith("video/")
                            ? "video"
                            : "file";
                        onAddAttachment(idea.id, {
                          id,
                          type,
                          name: file.name,
                          url,
                        });
                      });
                      e.target.value = "";
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 h-8 rounded-lg bg-muted/60 border border-border/60 px-2 text-xs"
                      placeholder="Paste link URL..."
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs text-muted-foreground hover:text-primary"
                      onClick={() => {
                        if (!idea || !newLink.trim()) return;
                        onAddAttachment(idea.id, {
                          id: Date.now().toString(),
                          type: "link",
                          name: newLink,
                          url: newLink,
                        });
                        setNewLink("");
                      }}
                    >
                      Add link
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  {idea.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="border border-border/60 rounded-lg p-2 flex flex-col gap-1 bg-muted/40"
                    >
                      {att.type === "image" ? (
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="h-24 flex items-center justify-center text-muted-foreground text-[10px] bg-background/60 rounded">
                          {att.type.toUpperCase()}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="flex-1 truncate text-xs text-foreground">
                          {att.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-primary"
                            onClick={() => window.open(att.url, "_blank")}
                          >
                            <Paperclip className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemoveAttachment(idea.id, att.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {idea.attachments.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      No attachments yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border/60 bg-muted/30 p-6 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  Assignment
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {idea.assignedTo ? (
                      <>
                        <Avatar className="h-7 w-7 border border-border/60">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {idea.assignedTo.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground">
                          {idea.assignedTo.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary"
                      onClick={() => setAssignOpen((v) => !v)}
                    >
                      Assign
                    </Button>
                    {assignOpen && (
                      <div className="absolute right-0 mt-1 w-44 rounded-lg bg-card border border-border/60 shadow-float z-10 py-1">
                        {teamMembers.map((member) => (
                          <button
                            key={member.id}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-[11px] text-foreground hover:bg-muted/80"
                            onClick={() => {
                              onAssign(idea.id, member);
                              setAssignOpen(false);
                            }}
                          >
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium">
                              {member.avatar}
                            </div>
                            <span className="truncate">{member.name}</span>
                          </button>
                        ))}
                        <button
                          className="w-full px-2 py-1.5 text-left text-[11px] text-muted-foreground hover:bg-muted/80 border-t border-border/60 mt-1"
                          onClick={() => {
                            onAssign(idea.id, null);
                            setAssignOpen(false);
                          }}
                        >
                          Remove assignment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  Due date
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="date"
                    className="h-8 rounded-lg border border-border/60 bg-background px-2 text-xs"
                    value={idea.dueDate ?? ""}
                    onChange={(e) =>
                      onChangeDueDate(idea.id, e.target.value || null)
                    }
                  />
                  {idea.dueDate && (
                    <span className="text-muted-foreground">
                      {idea.dueDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  Priority
                </h3>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {["low", "medium", "high"].map((level) => (
                    <button
                      key={level}
                      className={`px-2 py-1 rounded-full border capitalize ${
                        idea.priority === level
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border/60"
                      }`}
                      onClick={() =>
                        onChangePriority(
                          idea.id,
                          level as "low" | "medium" | "high"
                        )
                      }
                    >
                      {level}
                    </button>
                  ))}
                  <button
                    className="px-2 py-1 rounded-full border border-border/60"
                    onClick={() => onChangePriority(idea.id, null)}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {idea.labels.map((label) => (
                    <button
                      key={label.id}
                      className="px-2 py-1 rounded-full text-[11px] text-background"
                      style={{ backgroundColor: label.color }}
                      onClick={() => onRemoveLabel(idea.id, label.id)}
                    >
                      {label.name}
                    </button>
                  ))}
                  {idea.labels.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No labels yet.
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {[
                    { name: "Design", color: "#f97316" },
                    { name: "Idea", color: "#3b82f6" },
                    { name: "Script", color: "#10b981" },
                    { name: "Video", color: "#6366f1" },
                    { name: "High Impact", color: "#ef4444" },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      className="px-2 py-1 rounded-full text-[11px] text-background"
                      style={{ backgroundColor: preset.color }}
                      onClick={() =>
                        onAddLabel(idea.id, {
                          id: `${preset.name}-${preset.color}`,
                          name: preset.name,
                          color: preset.color,
                        })
                      }
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> Comments
                  </h3>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-4 text-xs">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-7 w-7 border border-border/60">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {comment.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs text-foreground">
                                {comment.author}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {comment.timestamp}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <button
                                onClick={() => {
                                  const next = prompt(
                                    "Edit comment",
                                    comment.text
                                  );
                                  if (next != null && next.trim()) {
                                    onUpdateComment(
                                      idea.id,
                                      comment.id,
                                      next.trim()
                                    );
                                  }
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  onDeleteComment(idea.id, comment.id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-foreground/90">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      No comments yet.
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 h-8 rounded-lg bg-muted/60 border border-border/60 px-2 text-xs"
                    placeholder="Write a comment…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (newComment.trim()) {
                          onAddCommentToIdea(idea.id, newComment.trim());
                          setNewComment("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => {
                      if (newComment.trim()) {
                        onAddCommentToIdea(idea.id, newComment.trim());
                        setNewComment("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Assistant
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Prototype placeholder — hook this into your AI backend to
                  generate subtasks, rewrite descriptions, and more.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[
                    "Generate Subtasks",
                    "Improve Description",
                    "Expand Idea",
                    "Rewrite in Clearer Tone",
                    "Create Social Media Post",
                    "Suggest Better Title",
                    "Summarize Task",
                  ].map((label) => (
                    <Button
                      key={label}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => {
                        // Stub: no-op in prototype
                        console.log("AI action triggered:", label);
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground">
                    Activity
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 text-[11px] text-muted-foreground">
                  {idea.activity.map((entry) => (
                    <div key={entry.id}>
                      [
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      ] <span className="font-medium">{entry.user}</span>{" "}
                      {entry.action}
                    </div>
                  ))}
                  {idea.activity.length === 0 && <div>No activity yet.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

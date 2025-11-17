import { useState, useCallback, useMemo } from "react";
import { useReactFlow } from "reactflow";
import { CommentPanel } from "@/components/CommentPanel";
import { KanbanBoard, type KanbanStatus } from "@/components/KanbanBoard";
import { TaskModal } from "@/components/TaskModal";
import { FlowToolbar } from "@/components/FlowToolbar";
import { FlowView } from "@/components/FlowView";
import { KanbanView } from "@/components/KanbanView";
import { useIdeaFlowLayout } from "@/hooks/useIdeaFlowLayout";
import { toast } from "sonner";

export interface Idea {
  id: string;
  title: string;
  description: string;
  type: "ai" | "manual";
  kanbanStatus?: KanbanStatus;
  assignedTo?: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate?: string;
  priority: "low" | "medium" | "high" | null;
  subtasks: {
    id: string;
    text: string;
    completed: boolean;
  }[];
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
  activity: {
    id: string;
    timestamp: number;
    user: string;
    action: string;
  }[];
  parentId?: string;
  isArchived?: boolean;
  archivedAt?: number;
  previousKanbanStatus?: KanbanStatus;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  reactions?: { thumbsUp: number; heart: number };
}

const mockAIIdeas: { title: string; description: string }[] = [
  {
    title: "Interactive Product Demos",
    description:
      "Create engaging video demonstrations showing product features in real-world scenarios. Focus on problem-solving aspects and user benefits.",
  },
  {
    title: "Customer Success Stories",
    description:
      "Share authentic testimonials and case studies from satisfied customers. Include metrics and specific outcomes achieved.",
  },
  {
    title: "Educational Content Series",
    description:
      "Develop a series of tutorial-style posts teaching valuable skills related to your product. Build authority and trust.",
  },
  {
    title: "Behind-the-Scenes Content",
    description:
      "Give followers a peek into your company culture, team members, and day-to-day operations. Humanize your brand.",
  },
  {
    title: "Industry Trend Analysis",
    description:
      "Share insights on current trends affecting your industry. Position your brand as a thought leader.",
  },
  {
    title: "User-Generated Content Campaigns",
    description:
      "Encourage customers to share their experiences. Feature their content to build community and social proof.",
  },
];

const mockComments: { [key: string]: Comment[] } = {
  "1": [
    {
      id: "c1",
      author: "Maria Chen",
      avatar: "MC",
      text: "This is a great direction! We should focus on mobile-first demos.",
      timestamp: "2 hours ago",
      reactions: { thumbsUp: 5, heart: 2 },
    },
    {
      id: "c2",
      author: "Tom Wilson",
      avatar: "TW",
      text: "Agreed! Can we also add some metrics about engagement?",
      timestamp: "1 hour ago",
      reactions: { thumbsUp: 3, heart: 1 },
    },
  ],
};

interface FlowContentProps {
  ideas: Idea[];
  comments: { [key: string]: Comment[] };
  onUpdateIdeas: (updater: (prev: Idea[]) => Idea[]) => void;
  onUpdateComments: (
    updater: (prev: { [key: string]: Comment[] }) => {
      [key: string]: Comment[];
    }
  ) => void;
}

const teamMembers = [
  { id: "1", name: "Alex Morgan", avatar: "A" },
  { id: "2", name: "Maria Chen", avatar: "M" },
  { id: "3", name: "David Kim", avatar: "D" },
];

export const FlowContent = ({
  ideas,
  comments,
  onUpdateIdeas,
  onUpdateComments,
}: FlowContentProps) => {
  const [viewMode, setViewMode] = useState<"flow" | "kanban">("flow");
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [prompt, setPrompt] = useState("");
  const [manualIdea, setManualIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { fitView, getNodes } = useReactFlow();

  const currentUserName = "You";

  const logActivity = useCallback(
    (ideaId: string, user: string, action: string) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                activity: [
                  {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    user,
                    action,
                  },
                  ...(idea.activity || []),
                ],
              }
            : idea
        )
      );
    },
    [onUpdateIdeas]
  );

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newIdeas = mockAIIdeas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now().toString() + index,
      type: "ai" as const,
      kanbanStatus: undefined,
      assignedTo: undefined,
      dueDate: undefined,
      priority: null,
      subtasks: [],
      attachments: [],
      labels: [],
      activity: [],
      parentId: undefined,
    }));

    onUpdateIdeas(() => newIdeas);
    setIsGenerating(false);
    toast.success("Ideas generated successfully!");

    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, onUpdateIdeas, prompt]);

  const handleRegenerate = useCallback(async () => {
    const aiIdeas = ideas.filter((idea) => idea.type === "ai");
    if (aiIdeas.length === 0) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newAIIdeas: Idea[] = mockAIIdeas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now().toString() + index,
      type: "ai" as const,
      kanbanStatus: undefined,
      assignedTo: undefined,
      dueDate: undefined,
      priority: null,
      subtasks: [],
      attachments: [],
      labels: [],
      activity: [],
      parentId: undefined,
    }));

    const manualIdeas = ideas.filter((idea) => idea.type === "manual");
    onUpdateIdeas(() => [...newAIIdeas, ...manualIdeas]);
    setIsGenerating(false);
    toast.success("AI ideas regenerated!");

    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, ideas, onUpdateIdeas]);

  const handleAddManualIdea = useCallback(() => {
    if (!manualIdea.trim()) return;

    const title = manualIdea.split(" ").slice(0, 8).join(" ");
    const newIdea: Idea = {
      id: Date.now().toString(),
      title: title.length < manualIdea.length ? title + "..." : title,
      description: manualIdea,
      type: "manual",
      kanbanStatus: undefined,
      assignedTo: undefined,
      dueDate: undefined,
      priority: null,
      subtasks: [],
      attachments: [],
      labels: [],
      activity: [],
      parentId: undefined,
      isArchived: false,
    };

    onUpdateIdeas((prevIdeas) => [...prevIdeas, newIdea]);
    setManualIdea("");
    toast.success("Idea added!");

    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, manualIdea, onUpdateIdeas]);

  const handleClearManualIdeas = useCallback(() => {
    onUpdateIdeas((prevIdeas) =>
      prevIdeas.filter((idea) => idea.type === "ai")
    );
    setManualIdea("");
    toast.success("Manual ideas cleared!");
  }, [onUpdateIdeas]);

  const handleDeleteIdea = useCallback(
    (id: string) => {
      onUpdateIdeas((prevIdeas) => {
        const toDelete = new Set<string>();

        const collectDescendants = (targetId: string) => {
          toDelete.add(targetId);
          prevIdeas.forEach((idea) => {
            if (idea.parentId === targetId) {
              collectDescendants(idea.id);
            }
          });
        };

        collectDescendants(id);

        return prevIdeas.filter((idea) => !toDelete.has(idea.id));
      });
      toast.success("Idea deleted!");
    },
    [onUpdateIdeas]
  );

  const handleSendToKanban = useCallback(
    (id: string) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) => {
          if (idea.id !== id) return idea;
          if (idea.kanbanStatus) return idea;
          return { ...idea, kanbanStatus: "Backlog" };
        })
      );
    },
    [onUpdateIdeas]
  );

  const handleAssign = useCallback(
    (
      id: string,
      member: {
        id: string;
        name: string;
        avatar: string;
      } | null
    ) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                assignedTo: member || undefined,
              }
            : idea
        )
      );
    },
    [onUpdateIdeas]
  );

  const handleAddSubIdea = useCallback(
    (parentId: string) => {
      const description = window.prompt("Describe your sub-idea:");
      if (!description || !description.trim()) return;

      const title = description.split(" ").slice(0, 8).join(" ");
      const newIdea: Idea = {
        id: Date.now().toString(),
        title: title.length < description.length ? title + "..." : title,
        description,
        type: "manual",
        kanbanStatus: undefined,
        assignedTo: undefined,
        dueDate: undefined,
        priority: null,
        subtasks: [],
        attachments: [],
        labels: [],
        activity: [],
        parentId,
        isArchived: false,
      };

      onUpdateIdeas((prevIdeas) => [...prevIdeas, newIdea]);
      toast.success("Sub-idea added!");
    },
    [onUpdateIdeas]
  );

  const handleOpenComments = useCallback((ideaId: string) => {
    setSelectedIdeaId(ideaId);
  }, []);

  const handleMoveCard = useCallback(
    (id: string, status: KanbanStatus) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                kanbanStatus: status,
              }
            : idea
        )
      );
      logActivity(id, currentUserName, `Moved card to ${status}`);
    },
    [logActivity, onUpdateIdeas]
  );

  const handleViewInFlow = useCallback(
    (ideaId: string) => {
      setViewMode("flow");

      setTimeout(() => {
        const allNodes = getNodes();
        const targetNodes = allNodes.filter((node) => node.id === ideaId);
        if (targetNodes.length === 0) return;

        fitView({
          nodes: targetNodes,
          padding: 0.2,
          duration: 800,
        });
      }, 150);
    },
    [fitView, getNodes]
  );

  const handleUpdateTitle = useCallback(
    (id: string, title: string) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                title,
              }
            : idea
        )
      );
      logActivity(id, currentUserName, "Title updated");
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleAddAttachment = useCallback(
    (
      id: string,
      attachment: {
        id: string;
        type: "image" | "file" | "video" | "link";
        name: string;
        url: string;
      }
    ) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                attachments: [...idea.attachments, attachment],
              }
            : idea
        )
      );
      logActivity(
        id,
        currentUserName,
        `Uploaded attachment: ${attachment.name}`
      );
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleRemoveAttachment = useCallback(
    (id: string, attachmentId: string) => {
      onUpdateIdeas((prevIdeas) => {
        let removedName: string | null = null;
        const updated = prevIdeas.map((idea) => {
          if (idea.id !== id) return idea;
          const attachments = idea.attachments.filter((att) => {
            if (att.id === attachmentId) {
              removedName = att.name;
              return false;
            }
            return true;
          });
          return { ...idea, attachments };
        });
        if (removedName) {
          logActivity(
            id,
            currentUserName,
            `Deleted attachment: ${removedName}`
          );
        }
        return updated;
      });
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleArchiveTask = useCallback(
    (id: string) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                isArchived: true,
                archivedAt: Date.now(),
                previousKanbanStatus: idea.kanbanStatus,
              }
            : idea
        )
      );
      logActivity(id, currentUserName, "Task archived");
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleAddLabel = useCallback(
    (id: string, label: { id: string; name: string; color: string }) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                labels: idea.labels.find((l) => l.id === label.id)
                  ? idea.labels
                  : [...idea.labels, label],
              }
            : idea
        )
      );
      logActivity(id, currentUserName, `Added label: ${label.name}`);
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleRemoveLabel = useCallback(
    (id: string, labelId: string) => {
      onUpdateIdeas((prevIdeas) => {
        let removedName: string | null = null;
        const updated = prevIdeas.map((idea) => {
          if (idea.id !== id) return idea;
          const labels = idea.labels.filter((label) => {
            if (label.id === labelId) {
              removedName = label.name;
              return false;
            }
            return true;
          });
          return { ...idea, labels };
        });
        if (removedName) {
          logActivity(id, currentUserName, `Removed label: ${removedName}`);
        }
        return updated;
      });
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleUpdateDescription = useCallback(
    (id: string, description: string) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                description,
              }
            : idea
        )
      );
      logActivity(id, currentUserName, "Description updated");
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleAddComment = useCallback(
    (text: string) => {
      if (!selectedIdeaId) return;

      const newComment: Comment = {
        id: Date.now().toString(),
        author: "You",
        avatar: "YO",
        text,
        timestamp: "Just now",
        reactions: { thumbsUp: 0, heart: 0 },
      };

      onUpdateComments((prevComments) => ({
        ...prevComments,
        [selectedIdeaId]: [...(prevComments[selectedIdeaId] || []), newComment],
      }));

      logActivity(selectedIdeaId, currentUserName, "Added a comment");
    },
    [currentUserName, logActivity, onUpdateComments, selectedIdeaId]
  );

  const handleDeleteComment = useCallback(
    (ideaId: string, commentId: string) => {
      onUpdateComments((prevComments) => {
        const ideaComments = prevComments[ideaId] || [];
        const updated = ideaComments.filter((c) => c.id !== commentId);
        return {
          ...prevComments,
          [ideaId]: updated,
        };
      });
      logActivity(ideaId, currentUserName, "Deleted a comment");
    },
    [currentUserName, logActivity, onUpdateComments]
  );

  const handleAddCommentToIdea = useCallback(
    (ideaId: string, text: string) => {
      if (!text.trim()) return;

      const newComment: Comment = {
        id: Date.now().toString(),
        author: "You",
        avatar: "YO",
        text,
        timestamp: "Just now",
        reactions: { thumbsUp: 0, heart: 0 },
      };

      onUpdateComments((prevComments) => ({
        ...prevComments,
        [ideaId]: [...(prevComments[ideaId] || []), newComment],
      }));

      logActivity(ideaId, currentUserName, "Added a comment");
    },
    [currentUserName, logActivity, onUpdateComments]
  );

  const handleUpdateComment = useCallback(
    (ideaId: string, commentId: string, text: string) => {
      onUpdateComments((prevComments) => {
        const ideaComments = prevComments[ideaId] || [];
        const updated = ideaComments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                text,
              }
            : c
        );
        return {
          ...prevComments,
          [ideaId]: updated,
        };
      });
      logActivity(ideaId, currentUserName, "Edited a comment");
    },
    [currentUserName, logActivity, onUpdateComments]
  );

  const handleDueDateChange = useCallback(
    (id: string, date: string | null) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                dueDate: date || undefined,
              }
            : idea
        )
      );
      logActivity(
        id,
        currentUserName,
        date ? `Due date set to ${date}` : "Due date cleared"
      );
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleOpenTask = useCallback((id: string) => {
    setSelectedTaskId(id);
  }, []);

  const handleCloseTask = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const handlePriorityChange = useCallback(
    (id: string, priority: "low" | "medium" | "high" | null) => {
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                priority,
              }
            : idea
        )
      );

      if (priority) {
        const label =
          priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
        logActivity(id, currentUserName, `Priority changed to ${label}`);
      }
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleAddSubtask = useCallback(
    (id: string, text: string) => {
      if (!text.trim()) return;

      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                subtasks: [
                  ...idea.subtasks,
                  {
                    id: Date.now().toString(),
                    text,
                    completed: false,
                  },
                ],
              }
            : idea
        )
      );

      logActivity(id, currentUserName, `Added subtask: ${text}`);
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleToggleSubtask = useCallback(
    (id: string, subtaskId: string) => {
      onUpdateIdeas((prevIdeas) => {
        let toggledText: string | null = null;

        const updated = prevIdeas.map((idea) => {
          if (idea.id !== id) return idea;

          const subtasks = idea.subtasks.map((st) => {
            if (st.id !== subtaskId) return st;
            toggledText = st.text;
            return { ...st, completed: !st.completed };
          });

          return { ...idea, subtasks };
        });

        if (toggledText) {
          logActivity(id, currentUserName, `Toggled subtask: ${toggledText}`);
        }

        return updated;
      });
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const handleRemoveSubtask = useCallback(
    (id: string, subtaskId: string) => {
      onUpdateIdeas((prevIdeas) => {
        let removedText: string | null = null;

        const updated = prevIdeas.map((idea) => {
          if (idea.id !== id) return idea;

          const subtasks = idea.subtasks.filter((st) => {
            if (st.id === subtaskId) {
              removedText = st.text;
              return false;
            }
            return true;
          });

          return { ...idea, subtasks };
        });

        if (removedText) {
          logActivity(id, currentUserName, `Removed subtask: ${removedText}`);
        }

        return updated;
      });
    },
    [currentUserName, logActivity, onUpdateIdeas]
  );

  const inputNodeData = useMemo(
    () => ({
      mode,
      onModeChange: setMode,
      prompt,
      onPromptChange: setPrompt,
      manualIdea,
      onManualIdeaChange: setManualIdea,
      onGenerate: handleGenerate,
      onAddManual: handleAddManualIdea,
      onRegenerate: handleRegenerate,
      onClearManual: handleClearManualIdeas,
      isGenerating,
      hasIdeas: ideas.length > 0,
    }),
    [
      handleAddManualIdea,
      handleClearManualIdeas,
      handleGenerate,
      handleRegenerate,
      ideas.length,
      isGenerating,
      manualIdea,
      mode,
      prompt,
    ]
  );

  const { nodeTypes, nodes, edges, handleNodesChange } = useIdeaFlowLayout(
    ideas,
    inputNodeData,
    handleOpenComments,
    handleDeleteIdea,
    handleAddSubIdea,
    handleSendToKanban,
    handleOpenTask
  );

  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId);
  const selectedTask = ideas.find((idea) => idea.id === selectedTaskId) || null;
  const selectedTaskComments = selectedTaskId
    ? comments[selectedTaskId] || []
    : [];

  return (
    <>
      <FlowToolbar viewMode={viewMode} onChangeView={setViewMode} />

      {viewMode === "flow" && (
        <FlowView
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
        />
      )}

      {viewMode === "kanban" && (
        <KanbanView
          ideas={ideas}
          onOpenComments={handleOpenComments}
          onMoveCard={handleMoveCard}
          onViewInFlow={handleViewInFlow}
          onAssign={handleAssign}
          onOpenTask={handleOpenTask}
        />
      )}

      <CommentPanel
        isOpen={!!selectedIdeaId}
        onClose={() => setSelectedIdeaId(null)}
        ideaTitle={selectedIdea?.title || ""}
        assignedTo={selectedIdea?.assignedTo}
        comments={selectedIdeaId ? comments[selectedIdeaId] || [] : []}
        onAddComment={handleAddComment}
      />

      <TaskModal
        isOpen={!!selectedTask}
        onClose={handleCloseTask}
        idea={selectedTask}
        teamMembers={teamMembers}
        onAssign={handleAssign}
        onChangeDueDate={handleDueDateChange}
        onChangePriority={handlePriorityChange}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
        onRemoveSubtask={handleRemoveSubtask}
        onUpdateTitle={handleUpdateTitle}
        onUpdateDescription={handleUpdateDescription}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
        comments={selectedTaskComments}
        onAddCommentToIdea={handleAddCommentToIdea}
        onDeleteComment={handleDeleteComment}
        onUpdateComment={handleUpdateComment}
        onArchiveTask={handleArchiveTask}
      />
    </>
  );
};

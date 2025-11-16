import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  type NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { CommentPanel } from "@/components/CommentPanel";
import { InputNode } from "@/components/InputNode";
import { IdeaNode } from "@/components/IdeaNode";
import { KanbanBoard, type KanbanStatus } from "@/components/KanbanBoard";
import { TaskModal } from "@/components/TaskModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Idea {
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
}

interface Comment {
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

const teamMembers = [
  { id: "1", name: "Alex Morgan", avatar: "A" },
  { id: "2", name: "Maria Chen", avatar: "M" },
  { id: "3", name: "David Kim", avatar: "D" },
];

const FlowContent = () => {
  const [viewMode, setViewMode] = useState<"flow" | "kanban">("flow");
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [prompt, setPrompt] = useState("");
  const [manualIdea, setManualIdea] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>(
    mockComments
  );

  const { fitView, getNodes } = useReactFlow();

  const currentUserName = "You";

  const logActivity = useCallback(
    (ideaId: string, user: string, action: string) => {
      setIdeas((prevIdeas) =>
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
    [setIdeas]
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

    setIdeas(newIdeas);
    setIsGenerating(false);
    toast.success("Ideas generated successfully!");

    // Auto-fit view after layout
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, prompt]);

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
    setIdeas([...newAIIdeas, ...manualIdeas]);
    setIsGenerating(false);
    toast.success("AI ideas regenerated!");

    // Auto-fit view after layout
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, ideas]);

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
    };

    setIdeas((prevIdeas) => [...prevIdeas, newIdea]);
    setManualIdea("");
    toast.success("Idea added!");

    // Auto-fit view after layout
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, manualIdea]);

  const handleClearManualIdeas = useCallback(() => {
    setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.type === "ai"));
    setManualIdea("");
    toast.success("Manual ideas cleared!");
  }, []);

  const handleDeleteIdea = useCallback((id: string) => {
    setIdeas((prevIdeas) => {
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
  }, []);

  const handleSendToKanban = useCallback(
    (id: string) => {
      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) => {
          if (idea.id !== id) return idea;
          if (idea.kanbanStatus) return idea; // prevent duplicates
          return { ...idea, kanbanStatus: "Backlog" };
        })
      );
    },
    [setIdeas]
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
      setIdeas((prevIdeas) =>
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
    [setIdeas]
  );

  const handleAddSubIdea = useCallback((parentId: string) => {
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
    };

    setIdeas((prevIdeas) => [...prevIdeas, newIdea]);
    toast.success("Sub-idea added!");
  }, []);

  const handleOpenComments = useCallback((ideaId: string) => {
    setSelectedIdeaId(ideaId);
  }, []);

  const handleMoveCard = useCallback(
    (id: string, status: KanbanStatus) => {
      setIdeas((prevIdeas) =>
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
    [logActivity, setIdeas]
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
      setIdeas((prevIdeas) =>
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
    [currentUserName, logActivity, setIdeas]
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
      setIdeas((prevIdeas) =>
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleRemoveAttachment = useCallback(
    (id: string, attachmentId: string) => {
      setIdeas((prevIdeas) => {
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleAddLabel = useCallback(
    (id: string, label: { id: string; name: string; color: string }) => {
      setIdeas((prevIdeas) =>
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleRemoveLabel = useCallback(
    (id: string, labelId: string) => {
      setIdeas((prevIdeas) => {
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleUpdateDescription = useCallback(
    (id: string, description: string) => {
      setIdeas((prevIdeas) =>
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
    [currentUserName, logActivity, setIdeas]
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

      setComments((prevComments) => ({
        ...prevComments,
        [selectedIdeaId]: [...(prevComments[selectedIdeaId] || []), newComment],
      }));

      logActivity(selectedIdeaId, currentUserName, "Added a comment");
    },
    [currentUserName, logActivity, selectedIdeaId]
  );

  const handleDeleteComment = useCallback(
    (ideaId: string, commentId: string) => {
      setComments((prevComments) => {
        const ideaComments = prevComments[ideaId] || [];
        const updated = ideaComments.filter((c) => c.id !== commentId);
        return {
          ...prevComments,
          [ideaId]: updated,
        };
      });
      logActivity(ideaId, currentUserName, "Deleted a comment");
    },
    [currentUserName, logActivity]
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

      setComments((prevComments) => ({
        ...prevComments,
        [ideaId]: [...(prevComments[ideaId] || []), newComment],
      }));

      logActivity(ideaId, currentUserName, "Added a comment");
    },
    [currentUserName, logActivity]
  );

  const handleUpdateComment = useCallback(
    (ideaId: string, commentId: string, text: string) => {
      setComments((prevComments) => {
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
    [currentUserName, logActivity]
  );

  const handleDueDateChange = useCallback(
    (id: string, date: string | null) => {
      setIdeas((prevIdeas) =>
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleOpenTask = useCallback((id: string) => {
    setSelectedTaskId(id);
  }, []);

  const handleCloseTask = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const handlePriorityChange = useCallback(
    (id: string, priority: "low" | "medium" | "high" | null) => {
      setIdeas((prevIdeas) =>
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleAddSubtask = useCallback(
    (id: string, text: string) => {
      if (!text.trim()) return;

      setIdeas((prevIdeas) =>
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleToggleSubtask = useCallback(
    (id: string, subtaskId: string) => {
      setIdeas((prevIdeas) => {
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
    [currentUserName, logActivity, setIdeas]
  );

  const handleRemoveSubtask = useCallback(
    (id: string, subtaskId: string) => {
      setIdeas((prevIdeas) => {
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
    [currentUserName, logActivity, setIdeas]
  );

  // React Flow nodes and edges
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      inputNode: InputNode,
      ideaNode: IdeaNode,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const draggedNodesRef = useRef(new Set<string>());

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

  useEffect(() => {
    const currentIdeaIds = new Set(ideas.map((idea) => idea.id));
    draggedNodesRef.current.forEach((id) => {
      if (!currentIdeaIds.has(id)) {
        draggedNodesRef.current.delete(id);
      }
    });

    setNodes((prevNodes) => {
      const previousPositions = new Map(
        prevNodes.map((node) => [node.id, node.position])
      );
      const horizontalSpacing = 420;
      const verticalOffset = 260;
      const totalIdeas = ideas.length;
      const startX =
        totalIdeas > 0 ? -((totalIdeas - 1) * horizontalSpacing) / 2 : 0;

      const inputNode: Node = {
        id: "input",
        type: "inputNode",
        position: { x: 0, y: 0 },
        data: inputNodeData,
        draggable: false,
      };

      const ideaNodes: Node[] = ideas.map((idea, index) => {
        const fallbackPosition = {
          x: startX + index * horizontalSpacing,
          y: verticalOffset,
        };

        const shouldPreservePosition = draggedNodesRef.current.has(idea.id);
        const preservedPosition = previousPositions.get(idea.id);

        return {
          id: idea.id,
          type: "ideaNode",
          position:
            shouldPreservePosition && preservedPosition
              ? preservedPosition
              : fallbackPosition,
          data: {
            ...idea,
            onOpenComments: handleOpenComments,
            onDelete: idea.type === "manual" ? handleDeleteIdea : undefined,
            onAddSubIdea: handleAddSubIdea,
            onSendToKanban: handleSendToKanban,
            onOpenTask: handleOpenTask,
          },
          draggable: true,
        };
      });

      return [inputNode, ...ideaNodes];
    });
  }, [
    handleAddSubIdea,
    handleDeleteIdea,
    handleOpenComments,
    handleSendToKanban,
    ideas,
    inputNodeData,
    setNodes,
  ]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.dragging) {
          draggedNodesRef.current.add(change.id);
        }
      });

      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const edges: Edge[] = useMemo(() => {
    return ideas.map((idea) => ({
      id: `${idea.parentId ?? "input"}-${idea.id}`,
      source: idea.parentId ?? "input",
      target: idea.id,
      type: "smoothstep",
      animated: true,
      style: {
        stroke: "hsl(var(--primary))",
        strokeWidth: 2,
        strokeOpacity: 0.6,
      },
    }));
  }, [ideas]);

  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId);
  const selectedTask = ideas.find((idea) => idea.id === selectedTaskId) || null;
  const selectedTaskComments = selectedTaskId
    ? comments[selectedTaskId] || []
    : [];

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/90 backdrop-blur px-2 py-1 rounded-full shadow-soft border border-border/60">
        <Button
          size="sm"
          variant={viewMode === "flow" ? "default" : "ghost"}
          className="text-xs px-3"
          onClick={() => setViewMode("flow")}
        >
          Flow View
        </Button>
        <Button
          size="sm"
          variant={viewMode === "kanban" ? "default" : "ghost"}
          className="text-xs px-3"
          onClick={() => setViewMode("kanban")}
        >
          Kanban View
        </Button>
      </div>

      {viewMode === "flow" && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          nodesDraggable={true}
          onNodesChange={handleNodesChange}
          nodeOrigin={[0.5, 0]}
          className="transition-all duration-500"
        >
          <Background color="hsl(var(--muted-foreground))" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "inputNode") return "hsl(var(--primary))";
              return "hsl(var(--card))";
            }}
            className="!bg-card !border-border"
          />
        </ReactFlow>
      )}

      {viewMode === "kanban" && (
        <div className="h-full w-full bg-muted/40 pt-14">
          <KanbanBoard
            ideas={ideas}
            onOpenComments={handleOpenComments}
            onMoveCard={handleMoveCard}
            onViewInFlow={handleViewInFlow}
            teamMembers={teamMembers}
            onAssign={handleAssign}
            onOpenTask={handleOpenTask}
          />
        </div>
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
      />
    </>
  );
};

const Index = () => {
  return (
    <div className="h-screen w-full bg-background">
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </div>
  );
};

export default Index;

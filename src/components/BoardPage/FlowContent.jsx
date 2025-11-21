import { useState, useCallback, useMemo } from "react";
import { useReactFlow } from "reactflow";
import { CommentPanel } from "./CommentPanel.jsx";
import { TaskModal } from "./TaskModal.jsx";
import { FlowView } from "./FlowView.jsx";
import { KanbanView } from "./KanbanView.jsx";
import { TableView } from "./TableView.jsx";
import { ListView } from "./ListView.jsx";
import { useIdeaFlowLayout } from "./hooks/useIdeaFlowLayout.js";
import { toast } from "sonner";
import { mockAIIdeas } from "../../data/mockData.js";
import { useNotifications } from "../../context/NotificationsContext";

export const FlowContent = ({
  ideas,
  comments,
  onUpdateIdeas,
  onUpdateComments,
  teamMembers,
  currentUser,
  currentRole,
  initialView = "flow",
  viewMode: controlledViewMode,
  onChangeView,
}) => {
  const { addNotification } = useNotifications();
  const [uncontrolledViewMode, setUncontrolledViewMode] = useState(initialView);
  const viewMode = controlledViewMode ?? uncontrolledViewMode;
  const handleChangeView = onChangeView ?? setUncontrolledViewMode;
  const [mode, setMode] = useState("ai");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { fitView, getNodes } = useReactFlow();

  const currentUserName = currentUser?.name || "You";
  const isViewer = currentRole === "viewer";

  const logActivity = useCallback(
    (ideaId, user, action) => {
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
    [isViewer, onUpdateIdeas]
  );

  const handleGenerate = useCallback(async (promptValue) => {
    if (isViewer) return;
    if (!promptValue || !promptValue.trim()) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newIdeas = mockAIIdeas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now().toString() + index,
      type: "ai",
      kanbanStatus: undefined,
      assignedTo: undefined,
      dueDate: undefined,
      priority: null,
      subtasks: [],
      attachments: [],
      labels: [],
      activity: [],
      parentId: undefined,
      showInFlow: true,
    }));

    onUpdateIdeas(() => newIdeas);
    setIsGenerating(false);
    toast.success("Ideas generated successfully!");

    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, isViewer, onUpdateIdeas]);

  const handleRegenerate = useCallback(async () => {
    if (isViewer) return;
    const aiIdeas = ideas.filter((idea) => idea.type === "ai");
    if (aiIdeas.length === 0) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newAIIdeas = mockAIIdeas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now().toString() + index,
      type: "ai",
      kanbanStatus: undefined,
      assignedTo: undefined,
      dueDate: undefined,
      priority: null,
      subtasks: [],
      attachments: [],
      labels: [],
      activity: [],
      parentId: undefined,
      showInFlow: true,
    }));

    const manualIdeas = ideas.filter((idea) => idea.type === "manual");
    onUpdateIdeas(() => [...newAIIdeas, ...manualIdeas]);
    setIsGenerating(false);
    toast.success("AI ideas regenerated!");

    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, ideas, isViewer, onUpdateIdeas]);

  const handleAddManualIdea = useCallback((manualIdeaValue) => {
    if (isViewer) return;
    if (!manualIdeaValue || !manualIdeaValue.trim()) return;

    const title = manualIdeaValue.split(" ").slice(0, 8).join(" ");
    const newIdea = {
      id: Date.now().toString(),
      title: title.length < manualIdeaValue.length ? title + "..." : title,
      description: manualIdeaValue,
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
      showInFlow: true,
    };

    onUpdateIdeas((prevIdeas) => [...prevIdeas, newIdea]);
    toast.success("Idea added!");

    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [fitView, isViewer, onUpdateIdeas]);

  const handleClearManualIdeas = useCallback(() => {
    if (isViewer) return;
    onUpdateIdeas((prevIdeas) =>
      prevIdeas.filter((idea) => idea.type === "ai")
    );
    toast.success("Manual ideas cleared!");
  }, [isViewer, onUpdateIdeas]);

  const handleDeleteIdea = useCallback(
    (id) => {
      if (isViewer) return;
      onUpdateIdeas((prevIdeas) => {
        const toDelete = new Set();

        const collectDescendants = (targetId) => {
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
    (id) => {
      if (isViewer) return;
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
    (id, member) => {
      if (isViewer) return;
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
      
      if (member) {
        addNotification({
          userId: member.id,
          message: `You were assigned to a task`,
          type: "assignment",
          taskId: id,
        });
      }
    },
    [isViewer, onUpdateIdeas, addNotification]
  );

  const handleAddSubIdea = useCallback(
    (parentId) => {
      if (isViewer) return;
      const description = window.prompt("Describe your sub-idea:");
      if (!description || !description.trim()) return;

      const title = description.split(" ").slice(0, 8).join(" ");
      const newIdea = {
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

  const handleOpenComments = useCallback((ideaId) => {
    setSelectedIdeaId(ideaId);
  }, []);

  const handleMoveCard = useCallback(
    (id, status) => {
      if (isViewer) return;
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
      
      // Notify assignee if exists
      const idea = ideas.find(i => i.id === id);
      if (idea && idea.assignedTo) {
        addNotification({
          userId: idea.assignedTo.id,
          message: `Task '${idea.title}' moved to ${status}`,
          type: "activity",
          taskId: id,
        });
      }
    },
    [isViewer, logActivity, onUpdateIdeas, ideas, currentUserName, addNotification]
  );

  const handleViewInFlow = useCallback(
    (ideaId) => {
      handleChangeView("flow");

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
    (id, title) => {
      if (isViewer) return;
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
    [currentUserName, isViewer, logActivity, onUpdateIdeas]
  );

  const handleAddAttachment = useCallback(
    (id, attachment) => {
      if (isViewer) return;
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
    (id, attachmentId) => {
      if (isViewer) return;
      onUpdateIdeas((prevIdeas) => {
        let removedName = null;
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
    (id) => {
      if (isViewer) return;
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
    (id, label) => {
      if (isViewer) return;
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
    (id, labelId) => {
      if (isViewer) return;
      onUpdateIdeas((prevIdeas) => {
        let removedName = null;
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
    (id, description) => {
      if (isViewer) return;
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
    (text) => {
      if (isViewer) return;
      if (!selectedIdeaId) return;

      const newComment = {
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
    [currentUserName, isViewer, logActivity, onUpdateComments, selectedIdeaId]
  );

  const handleDeleteComment = useCallback(
    (ideaId, commentId) => {
      if (isViewer) return;
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
    [currentUserName, isViewer, logActivity, onUpdateComments]
  );

  const handleAddCommentToIdea = useCallback(
    (ideaId, text) => {
      if (isViewer) return;
      if (!text.trim()) return;

      const newComment = {
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
    (ideaId, commentId, text) => {
      if (isViewer) return;
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
    (id, date) => {
      if (isViewer) return;
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

  const handleOpenTask = useCallback((id) => {
    setSelectedTaskId(id);
  }, []);

  const handleCloseTask = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const handlePriorityChange = useCallback(
    (id, priority) => {
      if (isViewer) return;
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
    (id, text) => {
      if (isViewer) return;
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
    (id, subtaskId) => {
      if (isViewer) return;
      onUpdateIdeas((prevIdeas) => {
        let toggledText = null;

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
    (id, subtaskId) => {
      if (isViewer) return;
      onUpdateIdeas((prevIdeas) => {
        let removedText = null;

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
      onGenerate: handleGenerate,
      onAddManual: handleAddManualIdea,
      onRegenerate: handleRegenerate,
      onClearManual: handleClearManualIdeas,
      isGenerating,
      hasIdeas: ideas.length > 0,
      canEdit: !isViewer,
    }),
    [
      handleAddManualIdea,
      handleClearManualIdeas,
      handleGenerate,
      handleRegenerate,
      ideas.length,
      isGenerating,
      mode,
      isViewer,
    ]
  );

  const { nodeTypes, nodes, edges, handleNodesChange } = useIdeaFlowLayout(
    ideas,
    inputNodeData,
    handleOpenComments,
    handleDeleteIdea,
    handleAddSubIdea,
    handleSendToKanban,
    handleOpenTask,
    !isViewer
  );

  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId);
  const selectedTask = ideas.find((idea) => idea.id === selectedTaskId) || null;
  const selectedTaskComments = selectedTaskId
    ? comments[selectedTaskId] || []
    : [];

  const handleAddTask = useCallback(
    (status = "Backlog") => {
      if (isViewer) return;
      const title = "New Task";
      const newIdea = {
        id: Date.now().toString(),
        title,
        description: "",
        type: "manual",
        kanbanStatus: status,
        assignedTo: undefined,
        dueDate: undefined,
        priority: null,
        subtasks: [],
        attachments: [],
        labels: [],
        activity: [],
        parentId: undefined,
        isArchived: false,
        showInFlow: false,
      };

      onUpdateIdeas((prevIdeas) => [...prevIdeas, newIdea]);
      toast.success("Task added!");
      
      // Log activity
      logActivity(newIdea.id, currentUserName, `Created task in ${status}`);
    },
    [currentUserName, isViewer, logActivity, onUpdateIdeas]
  );

  return (
    <>
      {viewMode === "flow" && (
        <FlowView
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          canEdit={!isViewer}
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
          onAddTask={handleAddTask}
          onReorderIdeas={onUpdateIdeas}
          canEdit={!isViewer}
        />
      )}

      {viewMode === "table" && <TableView />}
      {viewMode === "list" && (
        <ListView 
          ideas={ideas} 
          onAddTask={handleAddTask}
          onOpenTask={handleOpenTask}
        />
      )}

      <CommentPanel
        isOpen={!!selectedIdeaId}
        onClose={() => setSelectedIdeaId(null)}
        ideaTitle={selectedIdea?.title || ""}
        ideaId={selectedIdeaId}
        assignedTo={selectedIdea?.assignedTo}
        comments={selectedIdeaId ? comments[selectedIdeaId] || [] : []}
        onAddComment={handleAddComment}
        canComment={!isViewer}
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
        canEdit={!isViewer}
      />
    </>
  );
};

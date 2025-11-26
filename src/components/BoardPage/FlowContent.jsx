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
import { useBoard } from "../../context/BoardContext";

export const FlowContent = ({
  ideas,
  columns,
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
  const { createCard, updateCard, deleteCard, createFlowIdea, updateFlowIdea, deleteFlowIdea, currentBoard } = useBoard();

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

  const handleAddManualIdea = useCallback(async (manualIdeaValue) => {
    if (isViewer || !currentBoard) return;
    if (!manualIdeaValue || !manualIdeaValue.trim()) return;

    const title = manualIdeaValue.split(" ").slice(0, 8).join(" ");
    const description = manualIdeaValue;
    
    // Get the first flow ID or handle missing flow
    // For now, we assume the board has at least one flow or we use a default if we can't find one
    // Ideally, we should create a flow if none exists, but let's try to find one first
    let flowId = currentBoard.ai_flows?.[0]?.id;
    
    if (!flowId) {
       // If no flow exists, we might need to create one. 
       // For this iteration, let's assume we can't add without a flow and show an error
       // Or better, we could create a default flow here if we had createFlow in context.
       // Let's check if we can fallback or if we should block.
       // User said "get the current flow id".
       // If the board was just created, it might not have a flow.
       // Let's try to use the first available flow.
       if (currentBoard.ai_flows && currentBoard.ai_flows.length > 0) {
           flowId = currentBoard.ai_flows[0].id;
       } else {
           toast.error("No AI Flow found for this board. Please generate ideas first.");
           return;
       }
    }

    try {
      await createFlowIdea(flowId, title, description);
      toast.success("Idea added to flow!");
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    } catch (error) {
      // Error handled in context
    }
  }, [fitView, isViewer, currentBoard, createFlowIdea]);

  const handleClearManualIdeas = useCallback(() => {
    if (isViewer) return;
    onUpdateIdeas((prevIdeas) =>
      prevIdeas.filter((idea) => idea.type === "ai")
    );
    toast.success("Manual ideas cleared!");
  }, [isViewer, onUpdateIdeas]);

  const handleDeleteIdea = useCallback(
    async (id) => {
      if (isViewer) return;
      try {
        await deleteFlowIdea(id);
        toast.success("Idea deleted!");
      } catch (error) {
        // Error handled in context
      }
    },
    [deleteFlowIdea, isViewer]
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
    async (id, member) => {
      if (isViewer) return;
      try {
        await updateCard(id, { assigned_to: member ? [member.id] : [] });
        
        if (member) {
          addNotification({
            userId: member.id,
            message: `You were assigned to a task`,
            type: "assignment",
            taskId: id,
          });
        }
      } catch (error) {
        // Error handled in context
      }
    },
    [isViewer, updateCard, addNotification]
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
    async (id, date) => {
      if (isViewer) return;
      try {
        await updateCard(id, { due_date: date });
        logActivity(
          id,
          currentUserName,
          date ? `Due date set to ${date}` : "Due date cleared"
        );
      } catch (error) {
        // Error handled in context
      }
    },
    [currentUserName, logActivity, isViewer, updateCard]
  );

  const handleOpenTask = useCallback((id) => {
    setSelectedTaskId(id);
  }, []);

  const handleCloseTask = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const handlePriorityChange = useCallback(
    async (id, priority) => {
      if (isViewer) return;
      try {
        await updateCard(id, { priority });

        if (priority) {
          const label =
            priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
          logActivity(id, currentUserName, `Priority changed to ${label}`);
        }
      } catch (error) {
        // Error handled in context
      }
    },
    [currentUserName, logActivity, isViewer, updateCard]
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

  const handleUpdateTitle = useCallback(
    async (id, title) => {
      if (isViewer) return;
      try {
        await updateFlowIdea(id, { title });
        logActivity(id, currentUserName, "Updated title");
      } catch (error) {
        // Error handled in context
      }
    },
    [currentUserName, logActivity, isViewer, updateFlowIdea]
  );

  const handleUpdateDescription = useCallback(
    async (id, description) => {
      if (isViewer) return;
      try {
        await updateFlowIdea(id, { description });
        logActivity(id, currentUserName, "Updated description");
      } catch (error) {
        // Error handled in context
      }
    },
    [currentUserName, logActivity, isViewer, updateFlowIdea]
  );

  const handleAddAttachment = useCallback(
    (id, attachment) => {
      if (isViewer) return;
      // TODO: Implement attachment upload via attachmentService
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
      logActivity(id, currentUserName, `Added attachment: ${attachment.name}`);
    },
    [currentUserName, logActivity, onUpdateIdeas, isViewer]
  );

  const handleRemoveAttachment = useCallback(
    (id, attachmentId) => {
      if (isViewer) return;
      // TODO: Implement attachment deletion via attachmentService
      onUpdateIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                attachments: idea.attachments.filter((a) => a.id !== attachmentId),
              }
            : idea
        )
      );
      logActivity(id, currentUserName, "Removed attachment");
    },
    [currentUserName, logActivity, onUpdateIdeas, isViewer]
  );

  const handleAddLabel = useCallback(
    async (id, labelId) => {
      if (isViewer) return;
      try {
        const idea = ideas.find(i => i.id === id);
        const currentTags = idea?.tags || [];
        await updateCard(id, { tags: [...currentTags, labelId] });
        logActivity(id, currentUserName, "Added label");
      } catch (error) {
        // Error handled in context
      }
    },
    [currentUserName, logActivity, ideas, isViewer, updateCard]
  );

  const handleRemoveLabel = useCallback(
    async (id, labelId) => {
      if (isViewer) return;
      try {
        const idea = ideas.find(i => i.id === id);
        const currentTags = idea?.tags || [];
        await updateCard(id, { tags: currentTags.filter(t => t !== labelId) });
        logActivity(id, currentUserName, "Removed label");
      } catch (error) {
        // Error handled in context
      }
    },
    [currentUserName, logActivity, ideas, isViewer, updateCard]
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
      logActivity(id, currentUserName, "Archived task");
      handleCloseTask();
    },
    [currentUserName, handleCloseTask, logActivity, onUpdateIdeas, isViewer]
  );

  const handleMoveCard = useCallback(
    async (cardId, columnId) => {
      if (isViewer || !currentBoard) return;
      try {
        const column = currentBoard.columns?.find(c => c.id === columnId);
        if (!column) return;
        
        // Calculate new position (end of column)
        const cardsInColumn = ideas.filter(i => i.kanbanStatus === column.title);
        const position = cardsInColumn.length > 0 
          ? Math.max(...cardsInColumn.map(c => c.position || 0)) + 1000 
          : 0;

        await updateCard(cardId, { column_id: columnId, position });
      } catch (error) {
        // Error handled in context
      }
    },
    [currentBoard, ideas, isViewer, updateCard]
  );

  const handleViewInFlow = useCallback(
    (id) => {
      // TODO: Implement view in flow - scroll to node in flow view
      handleChangeView("flow");
    },
    [handleChangeView]
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
    async (status = "Backlog") => {
      if (isViewer || !currentBoard) return;
      
      // Find column ID for the status
      const column = currentBoard.columns?.find(c => c.title === status);
      if (!column) {
        toast.error(`Column "${status}" not found`);
        return;
      }

      // Calculate position (end of list)
      const cardsInColumn = ideas.filter(i => i.kanbanStatus === status);
      const position = cardsInColumn.length > 0 
        ? Math.max(...cardsInColumn.map(c => c.position || 0)) + 1000 
        : 0;

      try {
        await createCard(currentBoard.id, column.id, "New Task", position);
        toast.success("Task added!");
      } catch (error) {
        // Error handled in context
      }
    },
    [currentBoard, createCard, ideas, isViewer]
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
          columns={columns}
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

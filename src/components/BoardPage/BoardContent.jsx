import { useState } from "react";
import { CommentPanel } from "./Panels/CommentPanel.jsx";
import { TaskModal } from "./TaskModal";
import { KanbanView } from "./Kanban/KanbanView.jsx";
import { TableView } from "./Table/TableView.jsx";
import { ListView } from "./List/ListView.jsx";
import { FlowContent } from "./Flow/FlowContent.jsx";
import { toast } from "sonner";
import { useNotifications } from "../../context/NotificationsContext";
import { useBoard } from "../../context/BoardContext";

export const BoardContent = ({
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

  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { createCard, updateCard, updateFlowIdea, currentBoard } = useBoard();

  const currentUserName = currentUser?.name || "You";
  const isViewer = currentRole === "viewer";

  const logActivity = (ideaId, user, action) => {
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
  };

  const handleOpenComments = (ideaId) => {
    setSelectedIdeaId(ideaId);
  };

  const handleAddComment = (text) => {
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
  };

  const handleDeleteComment = (ideaId, commentId) => {
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
  };

  const handleAddCommentToIdea = (ideaId, text) => {
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
  };

  const handleUpdateComment = (ideaId, commentId, text) => {
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
  };

  const handleDueDateChange = async (id, date) => {
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
  };

  const handleOpenTask = (id) => {
    setSelectedTaskId(id);
  };

  const handleCloseTask = () => {
    setSelectedTaskId(null);
  };

  const handlePriorityChange = async (id, priority) => {
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
  };

  const handleAddSubtask = (id, text) => {
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
  };

  const handleToggleSubtask = (id, subtaskId) => {
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
  };

  const handleRemoveSubtask = (id, subtaskId) => {
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
  };

  const handleUpdateTitle = async (id, title) => {
    if (isViewer) return;
    try {
      await updateFlowIdea(id, { title });
      logActivity(id, currentUserName, "Updated title");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleUpdateDescription = async (id, description) => {
    if (isViewer) return;
    try {
      await updateFlowIdea(id, { description });
      logActivity(id, currentUserName, "Updated description");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleAddAttachment = (id, attachment) => {
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
  };

  const handleRemoveAttachment = (id, attachmentId) => {
    if (isViewer) return;
    // TODO: Implement attachment deletion via attachmentService
    onUpdateIdeas((prevIdeas) =>
      prevIdeas.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              attachments: idea.attachments.filter(
                (a) => a.id !== attachmentId
              ),
            }
          : idea
      )
    );
    logActivity(id, currentUserName, "Removed attachment");
  };

  const handleAddLabel = async (id, labelId) => {
    if (isViewer) return;
    try {
      const idea = ideas.find((i) => i.id === id);
      const currentTags = idea?.tags || [];
      await updateCard(id, { tags: [...currentTags, labelId] });
      logActivity(id, currentUserName, "Added label");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleRemoveLabel = async (id, labelId) => {
    if (isViewer) return;
    try {
      const idea = ideas.find((i) => i.id === id);
      const currentTags = idea?.tags || [];
      await updateCard(id, { tags: currentTags.filter((t) => t !== labelId) });
      logActivity(id, currentUserName, "Removed label");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleArchiveTask = (id) => {
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
  };

  const handleMoveCard = async (cardId, columnId) => {
    if (isViewer || !currentBoard) return;
    try {
      const column = currentBoard.columns?.find((c) => c.id === columnId);
      if (!column) return;

      // Calculate new position (end of column)
      const cardsInColumn = ideas.filter(
        (i) => i.kanbanStatus === column.title
      );
      const position =
        cardsInColumn.length > 0
          ? Math.max(...cardsInColumn.map((c) => c.position || 0)) + 1000
          : 0;

      await updateCard(cardId, { column_id: columnId, position });
    } catch (error) {
      // Error handled in context
    }
  };

  const handleViewInFlow = (id) => {
    // TODO: Implement view in flow - scroll to node in flow view
    handleChangeView("flow");
  };

  const handleAssign = async (id, member) => {
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
  };

  const handleAddTask = async (status = "Backlog") => {
    if (isViewer || !currentBoard) return;

    // Find column ID for the status
    const column = currentBoard.columns?.find((c) => c.title === status);
    if (!column) {
      toast.error(`Column "${status}" not found`);
      return;
    }

    // Calculate position (end of list)
    const cardsInColumn = ideas.filter((i) => i.kanbanStatus === status);
    const position =
      cardsInColumn.length > 0
        ? Math.max(...cardsInColumn.map((c) => c.position || 0)) + 1000
        : 0;

    try {
      await createCard(currentBoard.id, column.id, "New Task", position);
      toast.success("Task added!");
    } catch (error) {
      // Error handled in context
    }
  };

  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId);
  const selectedTask = ideas.find((idea) => idea.id === selectedTaskId) || null;
  const selectedTaskComments = selectedTaskId
    ? comments[selectedTaskId] || []
    : [];

  return (
    <>
      {viewMode === "flow" && (
        <FlowContent
          ideas={ideas}
          onUpdateIdeas={onUpdateIdeas}
          isViewer={isViewer}
          currentBoard={currentBoard}
          onOpenComments={handleOpenComments}
          onOpenTask={handleOpenTask}
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

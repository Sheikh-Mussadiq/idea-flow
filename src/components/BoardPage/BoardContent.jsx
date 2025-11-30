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
  cards,
  flowIdeas,
  columns,
  comments,
  onUpdateCards,
  onUpdateFlowIdeas,
  onUpdateComments,
  teamMembers,
  currentUser,
  currentRole,
  initialView = "flow",
  viewMode: controlledViewMode,
  onChangeView,
  activeFlowId,
}) => {
  const { addNotification } = useNotifications();
  const [uncontrolledViewMode, setUncontrolledViewMode] = useState(initialView);
  const viewMode = controlledViewMode ?? uncontrolledViewMode;
  const handleChangeView = onChangeView ?? setUncontrolledViewMode;

  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { createCard, updateCard, updateFlowIdea, currentBoard } = useBoard();

  const currentUserName =
    currentUser?.user?.full_name || currentUser?.name || "You";
  const isViewer = currentRole === "viewer";

  const logActivity = (itemId, user, action) => {
    // Check if item is a card or flow idea
    const isCard = cards.some((c) => c.id === itemId);

    if (isCard) {
      onUpdateCards((prevCards) =>
        prevCards.map((card) =>
          card.id === itemId
            ? {
                ...card,
                activity: [
                  {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    user,
                    action,
                  },
                  ...(card.activity || []),
                ],
              }
            : card
        )
      );
    } else {
      onUpdateFlowIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === itemId
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
    }
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

    // Subtasks are usually for cards
    onUpdateCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              subtasks: [
                ...card.subtasks,
                {
                  id: Date.now().toString(),
                  text,
                  completed: false,
                },
              ],
            }
          : card
      )
    );

    logActivity(id, currentUserName, `Added subtask: ${text}`);
  };

  const handleToggleSubtask = (id, subtaskId) => {
    if (isViewer) return;
    onUpdateCards((prevCards) => {
      let toggledText = null;

      const updated = prevCards.map((card) => {
        if (card.id !== id) return card;

        const subtasks = card.subtasks.map((st) => {
          if (st.id !== subtaskId) return st;
          toggledText = st.text;
          return { ...st, completed: !st.completed };
        });

        return { ...card, subtasks };
      });

      if (toggledText) {
        logActivity(id, currentUserName, `Toggled subtask: ${toggledText}`);
      }

      return updated;
    });
  };

  const handleRemoveSubtask = (id, subtaskId) => {
    if (isViewer) return;
    onUpdateCards((prevCards) => {
      let removedText = null;

      const updated = prevCards.map((card) => {
        if (card.id !== id) return card;

        const subtasks = card.subtasks.filter((st) => {
          if (st.id === subtaskId) {
            removedText = st.text;
            return false;
          }
          return true;
        });

        return { ...card, subtasks };
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
      // Check if it's a flow idea or card
      if (flowIdeas.some((i) => i.id === id)) {
        await updateFlowIdea(id, { title });
      } else {
        await updateCard(id, { title });
      }
      logActivity(id, currentUserName, "Updated title");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleUpdateDescription = async (id, description) => {
    if (isViewer) return;
    try {
      // Check if it's a flow idea or card
      if (flowIdeas.some((i) => i.id === id)) {
        await updateFlowIdea(id, { description });
      } else {
        await updateCard(id, { description });
      }
      logActivity(id, currentUserName, "Updated description");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleAddAttachment = (id, attachment) => {
    if (isViewer) return;
    // Assuming attachments are for cards for now
    onUpdateCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              attachments: [...card.attachments, attachment],
            }
          : card
      )
    );
    logActivity(id, currentUserName, `Added attachment: ${attachment.name}`);
  };

  const handleRemoveAttachment = (id, attachmentId) => {
    if (isViewer) return;
    onUpdateCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              attachments: card.attachments.filter(
                (a) => a.id !== attachmentId
              ),
            }
          : card
      )
    );
    logActivity(id, currentUserName, "Removed attachment");
  };

  const handleAddLabel = async (id, labelId) => {
    if (isViewer) return;
    try {
      const card = cards.find((i) => i.id === id);
      const currentTags = card?.tags || [];
      // Ensure we're adding UUIDs, not objects
      const tagId = typeof labelId === "string" ? labelId : labelId.id;
      if (!currentTags.includes(tagId)) {
        await updateCard(id, { tags: [...currentTags, tagId] });
        logActivity(id, currentUserName, "Added label");
      }
    } catch (error) {
      // Error handled in context
    }
  };

  const handleRemoveLabel = async (id, labelId) => {
    if (isViewer) return;
    try {
      const card = cards.find((i) => i.id === id);
      const currentTags = card?.tags || [];
      const tagId = typeof labelId === "string" ? labelId : labelId.id;
      await updateCard(id, { tags: currentTags.filter((t) => t !== tagId) });
      logActivity(id, currentUserName, "Removed label");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleArchiveTask = (id) => {
    if (isViewer) return;
    onUpdateCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              isArchived: true,
              archivedAt: Date.now(),
              previousKanbanStatus: card.kanbanStatus,
            }
          : card
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
      const cardsInColumn = column.cards || [];
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
      const memberId = member?.user_id || member?.id;
      await updateCard(id, { assigned_to: member ? [memberId] : [] });

      if (member) {
        addNotification({
          userId: memberId,
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
    const cardsInColumn = column.cards || [];
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

  const selectedIdea =
    flowIdeas.find((idea) => idea.id === selectedIdeaId) ||
    cards.find((c) => c.id === selectedIdeaId);
  const selectedTask = cards.find((c) => c.id === selectedTaskId) || null;
  const selectedTaskComments = selectedTaskId
    ? comments[selectedTaskId] || []
    : [];

  return (
    <>
      {viewMode === "flow" && (
        <FlowContent
          ideas={flowIdeas}
          onUpdateIdeas={onUpdateFlowIdeas}
          isViewer={isViewer}
          currentBoard={currentBoard}
          onOpenComments={handleOpenComments}
          onOpenTask={handleOpenTask}
          activeFlowId={activeFlowId}
        />
      )}

      {viewMode === "kanban" && (
        <KanbanView
          ideas={cards}
          columns={columns}
          onOpenComments={handleOpenComments}
          onMoveCard={handleMoveCard}
          onViewInFlow={handleViewInFlow}
          onAssign={handleAssign}
          onOpenTask={handleOpenTask}
          onAddTask={handleAddTask}
          onReorderIdeas={onUpdateCards}
          canEdit={!isViewer}
        />
      )}

      {viewMode === "table" && <TableView />}
      {viewMode === "list" && (
        <ListView
          ideas={cards}
          columns={columns}
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

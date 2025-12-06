import { useState } from "react";
import { CommentPanel } from "./Panels/CommentPanel.jsx";
import { TaskModal } from "./TaskModal/TaskModal.jsx";
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
  const {
    createCard,
    updateCard,
    updateFlowIdea,
    currentBoard,
    addAiIdeaComment,
    updateAiIdeaComment,
    deleteAiIdeaComment,
    addCardComment,
    updateCardComment,
    deleteCardComment,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    addAttachment,
    deleteAttachment,
    createTag,
    deleteTag,
    addTagToCard,
    removeTagFromCard,
  } = useBoard();

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

  const handleAddComment = async (text) => {
    if (isViewer) return;
    if (!selectedIdeaId) return;

    try {
      // Determine if it's an AI idea or a card
      const isAiIdea = flowIdeas.some((idea) => idea.id === selectedIdeaId);

      if (isAiIdea) {
        await addAiIdeaComment(selectedIdeaId, text);
      } else {
        await addCardComment(selectedIdeaId, text);
      }

      logActivity(selectedIdeaId, currentUserName, "Added a comment");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (isViewer) return;
    if (!selectedIdeaId) return;

    try {
      // Determine if it's an AI idea or a card
      const isAiIdea = flowIdeas.some((idea) => idea.id === selectedIdeaId);

      if (isAiIdea) {
        await deleteAiIdeaComment(selectedIdeaId, commentId);
      } else {
        await deleteCardComment(selectedIdeaId, commentId);
      }

      logActivity(selectedIdeaId, currentUserName, "Deleted a comment");
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleAddCommentToCard = async (cardId, text) => {
    if (isViewer) return;
    if (!text.trim()) return;

    try {
      await addCardComment(cardId, text);
      logActivity(cardId, currentUserName, "Added a comment");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleUpdateComment = async (commentId, text) => {
    if (isViewer) return;
    if (!selectedIdeaId) return;

    try {
      // Determine if it's an AI idea or a card
      const isAiIdea = flowIdeas.some((idea) => idea.id === selectedIdeaId);

      if (isAiIdea) {
        await updateAiIdeaComment(commentId, text);
      } else {
        await updateCardComment(commentId, text);
      }

      logActivity(selectedIdeaId, currentUserName, "Edited a comment");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDueDateChange = async (id, date) => {
    if (isViewer) return;
    try {
      await updateCard(id, { dueDate: date });
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

  const handleAddSubtask = async (id, text) => {
    if (isViewer) return;
    if (!text.trim()) return;

    try {
      await createSubtask(id, text);
      logActivity(id, currentUserName, `Added subtask: ${text}`);
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  };

  const handleToggleSubtask = async (id, subtaskId) => {
    if (isViewer) return;

    // Find current status to toggle it
    const card = cards.find((c) => c.id === id);
    const subtask = card?.subtasks?.find((st) => st.id === subtaskId);
    if (!subtask) return;

    try {
      // Backend uses is_completed, but we need to send isCompleted for the context to map it
      const currentCompleted =
        subtask.is_completed || subtask.isCompleted || false;
      await updateSubtask(id, subtaskId, { isCompleted: !currentCompleted });
      logActivity(
        id,
        currentUserName,
        `Toggled subtask: ${subtask.title || subtask.text}`
      );
    } catch (error) {
      console.error("Error toggling subtask:", error);
    }
  };

  const handleRemoveSubtask = async (id, subtaskId) => {
    if (isViewer) return;

    try {
      await deleteSubtask(id, subtaskId);
      logActivity(id, currentUserName, "Removed subtask");
    } catch (error) {
      console.error("Error removing subtask:", error);
    }
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

  const handleAddAttachment = async (id, file) => {
    if (isViewer) return;
    try {
      await addAttachment(id, file);
      logActivity(id, currentUserName, `Added attachment: ${file.name}`);
    } catch (error) {
      console.error("Error adding attachment:", error);
    }
  };

  const handleRemoveAttachment = async (id, attachmentId) => {
    if (isViewer) return;
    try {
      await deleteAttachment(id, attachmentId);
      logActivity(id, currentUserName, "Removed attachment");
    } catch (error) {
      console.error("Error removing attachment:", error);
    }
  };

  const handleAddLabel = async (id, labelId) => {
    if (isViewer) return;
    try {
      // Ensure we're adding UUIDs, not objects, but the context helper handles it
      const tagId = typeof labelId === "string" ? labelId : labelId.id;
      await addTagToCard(id, tagId);
      logActivity(id, currentUserName, "Added label");
    } catch (error) {
      console.error("Error adding label:", error);
    }
  };

  const handleRemoveLabel = async (id, labelId) => {
    if (isViewer) return;
    try {
      const tagId = typeof labelId === "string" ? labelId : labelId.id;
      await removeTagFromCard(id, tagId);
      logActivity(id, currentUserName, "Removed label");
    } catch (error) {
      console.error("Error removing label:", error);
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

  const handleMoveCard = async (cardId, columnId, newIndex) => {
    if (isViewer || !currentBoard) return;
    try {
      const column = currentBoard.columns?.find((c) => c.id === columnId);
      if (!column) return;

      // Get all cards currently in this column (excluding the moving one to find insertion point)
      const cardsInColumn = cards
        .filter((c) => c.column_id === columnId && c.id !== cardId)
        .sort((a, b) => (a.position || 0) - (b.position || 0));

      let position;
      if (typeof newIndex === "number") {
        if (cardsInColumn.length === 0) {
          position = 1000;
        } else if (newIndex === 0) {
          // Top of list
          position = (cardsInColumn[0].position || 0) / 2;
        } else if (newIndex >= cardsInColumn.length) {
          // End of list
          position =
            (cardsInColumn[cardsInColumn.length - 1].position || 0) + 1000;
        } else {
          // Middle
          const prev = cardsInColumn[newIndex - 1];
          const next = cardsInColumn[newIndex];
          position = ((prev.position || 0) + (next.position || 0)) / 2;
        }
      } else {
        // Default to end
        position =
          cardsInColumn.length > 0
            ? Math.max(...cardsInColumn.map((c) => c.position || 0)) + 1000
            : 1000;
      }

      await updateCard(cardId, {
        column_id: columnId,
        position,
        kanbanStatus: column.title,
      });
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
    ? selectedTask?.comments || []
    : [];
  const selectedIdeaComments = selectedIdeaId
    ? selectedIdea?.idea_comments || selectedIdea?.comments || []
    : [];

  return (
    <>
      {viewMode === "flow" && (
        <FlowContent
          ideas={flowIdeas}
          onUpdateIdeas={onUpdateFlowIdeas}
          isViewer={isViewer}
          currentBoard={currentBoard}
          currentUser={currentUser}
          onOpenComments={handleOpenComments}
          onOpenTask={handleOpenTask}
          activeFlowId={activeFlowId}
        />
      )}

      {viewMode === "kanban" && (
        <KanbanView
          cards={cards}
          columns={columns}
          onOpenComments={handleOpenComments}
          onMoveCard={handleMoveCard}
          onViewInFlow={handleViewInFlow}
          onAssign={handleAssign}
          onOpenTask={handleOpenTask}
          onAddTask={handleAddTask}
          onReorderCards={onUpdateCards}
          canEdit={!isViewer}
        />
      )}

      {viewMode === "table" && <TableView />}
      {viewMode === "list" && (
        <ListView
          cards={cards}
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
        comments={selectedIdeaComments}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
        canComment={!isViewer}
      />

      <TaskModal
        isOpen={!!selectedTask}
        onClose={handleCloseTask}
        idea={selectedTask}
        columns={columns}
        teamMembers={teamMembers}
        availableTags={currentBoard?.tags || []}
        boardId={currentBoard?.id}
        onAssign={handleAssign}
        onStatusChange={(columnId) => handleMoveCard(selectedTask.id, columnId)}
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
        onCreateTag={createTag}
        comments={selectedTaskComments}
        onAddCommentToIdea={handleAddCommentToCard}
        onDeleteComment={(commentId) => handleDeleteComment(commentId)}
        onUpdateComment={handleUpdateComment}
        onArchiveTask={handleArchiveTask}
        onUpdateCard={updateCard}
        canEdit={!isViewer}
      />
    </>
  );
};

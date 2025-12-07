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
import { useAiIdeaCommentsRealtime } from "../../hooks/useAiIdeaCommentsRealtime";

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
  const [selectedCardId, setSelectedCardId] = useState(null);
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

  // Set up realtime subscription for ALL AI idea comments
  // This ensures comments update in flowIdeas even when panel is closed
  useAiIdeaCommentsRealtime(flowIdeas, onUpdateFlowIdeas);

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

  const handleOpenCard = (id) => {
    if (selectedIdeaId) setSelectedIdeaId(null);
    setSelectedCardId(id);
  };

  const handleCloseCard = () => {
    setSelectedCardId(null);
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
    handleCloseCard();
  };

  const handleMoveCard = async (cardId, columnId, newIndex) => {
    if (isViewer || !currentBoard) return;
    try {
      const column = currentBoard.columns?.find((c) => c.id === columnId);
      if (!column) return;

      // Find the moving card
      const movingCard =
        cards.find((c) => c.id === cardId) ||
        currentBoard.cards.find((c) => c.id === cardId);

      if (!movingCard) return;

      // Check if this is a cross-column move
      const isColumnChange = movingCard.column_id !== columnId;

      // Get all cards in the target column (excluding the moving one)
      const targetColumnCards = cards
        .filter((c) => c.column_id === columnId && c.id !== cardId)
        .sort((a, b) => (a.position || 0) - (b.position || 0));

      // Construct the final ordered list for target column
      const finalTargetCards = [...targetColumnCards];
      let insertIndex =
        typeof newIndex === "number" ? newIndex : finalTargetCards.length;

      // Ensure index is within bounds
      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > finalTargetCards.length)
        insertIndex = finalTargetCards.length;

      finalTargetCards.splice(insertIndex, 0, movingCard);

      // Prepare updates for target column
      const targetUpdates = finalTargetCards.map((card, index) => {
        const newPosition = index + 1;

        // Always update the moved card to ensure column change is persisted
        if (card.id === cardId) {
          return updateCard(cardId, {
            column_id: columnId,
            position: newPosition,
            kanbanStatus: column.title,
          });
        }
        // For other cards, only update if position doesn't match strict sequence
        else if (card.position !== newPosition) {
          return updateCard(card.id, { position: newPosition });
        }
        return Promise.resolve();
      });

      // If this is a cross-column move, also update the source column
      const allUpdates = [...targetUpdates];

      if (isColumnChange) {
        const sourceColumn = currentBoard.columns?.find(
          (c) => c.id === movingCard.column_id
        );

        if (sourceColumn) {
          // Get all cards in the source column (excluding the moved card)
          const sourceColumnCards = cards
            .filter(
              (c) => c.column_id === movingCard.column_id && c.id !== cardId
            )
            .sort((a, b) => (a.position || 0) - (b.position || 0));

          // Resequence source column cards
          const sourceUpdates = sourceColumnCards.map((card, index) => {
            const newPosition = index + 1;
            if (card.position !== newPosition) {
              return updateCard(card.id, { position: newPosition });
            }
            return Promise.resolve();
          });

          allUpdates.push(...sourceUpdates);
        }
      }

      await Promise.all(allUpdates);
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
      const memberId = member?.user?.id || member?.user_id || member?.id;
      if (!memberId) return;

      // Get current card to check existing assignees
      const currentCard = cards.find((c) => c.id === id);
      const currentAssignees = currentCard?.assigned_to || [];

      // Toggle: if already assigned, remove; otherwise add
      const isAlreadyAssigned = currentAssignees.includes(memberId);
      const newAssignees = isAlreadyAssigned
        ? currentAssignees.filter((uid) => uid !== memberId)
        : [...currentAssignees, memberId];

      await updateCard(id, { assigned_to: newAssignees });

      // Send notification only when adding (not removing)
      if (!isAlreadyAssigned && member) {
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

  const handleAddCard = async (columnId) => {
    if (isViewer || !currentBoard) return;

    // Find column ID for the status
    const column = currentBoard.columns?.find((c) => c.id === columnId);
    if (!column) {
      toast.error(`Column "${columnId}" not found`);
      return;
    }

    // Calculate position (end of list)
    const cardsInColumn = cards.filter((c) => c.column_id === column.id) || [];
    const position =
      cardsInColumn.length > 0
        ? Math.max(...cardsInColumn.map((c) => c.position || 0)) + 1
        : 1;

    try {
      await createCard(currentBoard.id, column.id, "New Card", position);
      toast.success("Card added!");
    } catch (error) {
      // Error handled in context
    }
  };

  const selectedIdea =
    flowIdeas.find((idea) => idea.id === selectedIdeaId) ||
    cards.find((c) => c.id === selectedIdeaId);
  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;
  const selectedCardComments = selectedCardId
    ? selectedCard?.comments || []
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
          onOpenTask={handleOpenCard}
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
          onOpenTask={handleOpenCard}
          onAddCard={handleAddCard}
          onReorderCards={onUpdateCards}
          canEdit={!isViewer}
        />
      )}

      {viewMode === "table" && <TableView />}
      {viewMode === "list" && (
        <ListView
          cards={cards}
          columns={columns}
          onAddCard={handleAddCard}
          onOpenTask={handleOpenCard}
          onMoveCard={handleMoveCard}
          onReorderCards={onUpdateCards}
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
        isOpen={!!selectedCard}
        onClose={handleCloseCard}
        card={selectedCard}
        columns={columns}
        teamMembers={teamMembers}
        availableTags={currentBoard?.tags || []}
        boardId={currentBoard?.id}
        onAssign={handleAssign}
        onStatusChange={(columnId) => handleMoveCard(selectedCard.id, columnId)}
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
        comments={selectedCardComments}
        onAddComment={handleAddCommentToCard}
        onDeleteComment={(commentId) => handleDeleteComment(commentId)}
        onUpdateComment={handleUpdateComment}
        onArchiveTask={handleArchiveTask}
        onUpdateCard={updateCard}
        canEdit={!isViewer}
      />
    </>
  );
};

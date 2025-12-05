import { createContext, useContext, useState, useEffect } from "react";
import { boardService } from "../services/boardService";
import { cardService } from "../services/cardService";
import { columnService } from "../services/columnService";
import { flowService } from "../services/flowService";
import { memberService } from "../services/memberService";
import { aiIdeaCommentService } from "../services/aiIdeaCommentService";
import { commentService } from "../services/commentService";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const BoardContext = createContext(null);

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBoard, setCurrentBoard] = useState(null);
  const { authUser } = useAuth();

  // Fetch boards list on mount
  useEffect(() => {
    fetchBoards();

    // Realtime subscription for boards list
    const channel = supabase
      .channel("public:boards")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "boards" },
        () => {
          fetchBoards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBoards = async () => {
    try {
      const data = await boardService.getBoardsList();
      setBoards(data);
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardDetails = async (boardId) => {
    try {
      setLoading(true);
      const data = await boardService.getBoardDetails(boardId);
      setCurrentBoard(data);
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching board details:", error);
      toast.error("Failed to load board details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (name, description = "") => {
    try {
      if (!authUser) throw new Error("User not authenticated");

      const newBoard = await boardService.createBoard({
        name,
        description,
        owner_id: authUser.id,
        is_favorite: false,
        is_archived: false,
      });

      setBoards((prev) => [newBoard, ...prev]);
      toast.success(`Board "${name}" created`);
      return newBoard;
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board");
      throw error;
    }
  };

  const updateBoard = async (boardId, updates) => {
    try {
      const updatedBoard = await boardService.updateBoard(boardId, updates);
      setBoards((prev) =>
        prev.map((b) => (b.id === boardId ? { ...b, ...updatedBoard } : b))
      );
      if (currentBoard?.id === boardId) {
        setCurrentBoard((prev) => ({ ...prev, ...updatedBoard }));
      }
      return updatedBoard;
    } catch (error) {
      console.error("Error updating board:", error);
      toast.error("Failed to update board");
      throw error;
    }
  };

  const deleteBoard = async (boardId) => {
    try {
      await boardService.deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
      toast.success("Board deleted");
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board");
    }
  };

  const archiveBoard = async (boardId) => {
    try {
      await updateBoard(boardId, { is_archived: true });
      toast.success("Board archived");
    } catch (error) {
      console.error("Error archiving board:", error);
    }
  };

  const restoreBoard = async (boardId) => {
    try {
      await updateBoard(boardId, { is_archived: false });
      toast.success("Board restored");
    } catch (error) {
      console.error("Error restoring board:", error);
    }
  };

  const duplicateBoard = async (boardId) => {
    // TODO: Implement deep copy on backend or via complex service logic
    toast.error("Duplicate functionality coming soon");
  };

  const toggleFavorite = async (boardId) => {
    try {
      const board = boards.find((b) => b.id === boardId);
      if (!board) return;

      const updatedBoard = await boardService.toggleFavorite(
        boardId,
        !board.is_favorite
      );
      setBoards((prev) =>
        prev.map((b) =>
          b.id === boardId ? { ...b, is_favorite: updatedBoard.is_favorite } : b
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  // --- Card Operations ---

  const updateCurrentBoardCards = (updater) => {
    if (!currentBoard) return;
    setCurrentBoard((prev) => ({
      ...prev,
      cards:
        typeof updater === "function" ? updater(prev.cards || []) : updater,
    }));
  };

  const updateCurrentBoardFlowIdeas = (updater) => {
    if (!currentBoard) return;
    setCurrentBoard((prev) => ({
      ...prev,
      flowIdeas:
        typeof updater === "function" ? updater(prev.flowIdeas || []) : updater,
    }));
  };

  const createCard = async (boardId, columnId, title, position) => {
    try {
      const newCard = await cardService.createCard({
        board_id: boardId,
        column_id: columnId,
        title,
        position,
        description: "",
        priority: null,
        assigned_to: [],
        tags: [],
      });

      if (currentBoard?.id === boardId) {
        const newIdea = {
          ...newCard,
          kanbanStatus:
            currentBoard.columns.find((c) => c.id === columnId)?.title ||
            "Backlog",
          assignedTo: null,
          assignees: [],
          labels: [],
          subtasks: [],
          attachments: [],
          comments: [],
          boardId: boardId,
        };

        setCurrentBoard((prev) => ({
          ...prev,
          cards: [...(prev.cards || []), newIdea],
        }));
      }

      return newCard;
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Failed to create card");
      throw error;
    }
  };

  const updateCard = async (cardId, updates) => {
    try {
      // Optimistic update
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          cards: prev.cards.map((card) =>
            card.id === cardId ? { ...card, ...updates } : card
          ),
        }));
      }

      // Map frontend fields to backend fields if necessary
      const backendUpdates = {};
      if (updates.title !== undefined) backendUpdates.title = updates.title;
      if (updates.description !== undefined)
        backendUpdates.description = updates.description;
      if (updates.priority !== undefined)
        backendUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined)
        backendUpdates.due_date = updates.dueDate;
      if (updates.columnId !== undefined)
        backendUpdates.column_id = updates.columnId;
      if (updates.column_id !== undefined)
        backendUpdates.column_id = updates.column_id;
      if (updates.position !== undefined)
        backendUpdates.position = updates.position;

      // Handle special fields like assigned_to, tags if needed
      // For now assuming simple updates

      await cardService.updateCard(cardId, backendUpdates);
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Failed to update card");
      // Revert optimistic update? (Ideally yes, but skipping for simplicity)
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  const deleteCard = async (cardId) => {
    try {
      // Optimistic update
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          cards: prev.cards.filter((card) => card.id !== cardId),
        }));
      }

      await cardService.deleteCard(cardId);
      toast.success("Card deleted");
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to delete card");
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  const moveCard = async (cardId, newColumnId, newPosition) => {
    try {
      // Optimistic update handled in component usually, but we can do it here too
      // Ideally we update the local state immediately
      if (currentBoard) {
        const newStatus = currentBoard.columns.find(
          (c) => c.id === newColumnId
        )?.title;
        setCurrentBoard((prev) => ({
          ...prev,
          cards: prev.cards.map((card) =>
            card.id === cardId
              ? { ...card, kanbanStatus: newStatus, position: newPosition }
              : card
          ),
        }));
      }

      await cardService.updateCard(cardId, {
        column_id: newColumnId,
        position: newPosition,
      });
    } catch (error) {
      console.error("Error moving card:", error);
      toast.error("Failed to move card");
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  // --- Column Operations ---

  const createColumn = async (boardId, title, position) => {
    try {
      const newColumn = await columnService.createColumn({
        board_id: boardId,
        title,
        position,
      });

      if (currentBoard?.id === boardId) {
        setCurrentBoard((prev) => ({
          ...prev,
          columns: [...(prev.columns || []), { ...newColumn, cards: [] }],
        }));
      }
      return newColumn;
    } catch (error) {
      console.error("Error creating column:", error);
      toast.error("Failed to create column");
      throw error;
    }
  };

  const updateColumn = async (columnId, title) => {
    try {
      if (currentBoard) {
        const oldColumn = currentBoard.columns.find((c) => c.id === columnId);
        const oldTitle = oldColumn?.title;

        setCurrentBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === columnId ? { ...col, title } : col
          ),
          // Also update the kanbanStatus of cards in this column
          cards: prev.cards.map((card) =>
            card.kanbanStatus === oldTitle
              ? { ...card, kanbanStatus: title }
              : card
          ),
        }));
      }

      await columnService.updateColumn(columnId, { title });
    } catch (error) {
      console.error("Error updating column:", error);
      toast.error("Failed to update column");
    }
  };

  const deleteColumn = async (columnId) => {
    try {
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          columns: prev.columns.filter((col) => col.id !== columnId),
        }));
      }

      await columnService.deleteColumn(columnId);
      toast.success("Column deleted");
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Failed to delete column");
    }
  };

  const updateColumnPositions = async (columnUpdates) => {
    try {
      // Optimistic update
      if (currentBoard) {
        const updatesMap = new Map(
          columnUpdates.map((u) => [u.id, u.position])
        );
        setCurrentBoard((prev) => ({
          ...prev,
          columns: prev.columns
            .map((col) => ({
              ...col,
              position: updatesMap.has(col.id)
                ? updatesMap.get(col.id)
                : col.position,
            }))
            .sort((a, b) => a.position - b.position),
        }));
      }

      await columnService.updateColumnPositions(columnUpdates);
    } catch (error) {
      console.error("Error updating column positions:", error);
      toast.error("Failed to reorder columns");
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  // --- Flow Operations ---

  const createFlow = async (boardId, name, description = "") => {
    try {
      const newFlow = await flowService.createFlow({
        board_id: boardId,
        name,
        description,
      });

      // Update currentBoard if it's the same board
      if (currentBoard?.id === boardId) {
        setCurrentBoard((prev) => ({
          ...prev,
          ai_flows: [...(prev.ai_flows || []), { ...newFlow, ideas: [] }],
        }));
      }

      // Update boards list to include the new flow
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId
            ? {
                ...board,
                ai_flows: [
                  ...(board.ai_flows || []),
                  { ...newFlow, ideasCount: 0 },
                ],
              }
            : board
        )
      );

      toast.success(`Flow "${name}" created`);
      return newFlow;
    } catch (error) {
      console.error("Error creating flow:", error);
      toast.error("Failed to create flow");
      throw error;
    }
  };

  const createFlowIdea = async (
    flowId,
    title,
    description = "",
    parentId = null
  ) => {
    try {
      const newIdea = await flowService.createIdea({
        flow_id: flowId,
        title,
        description,
        parent_id: parentId,
      });

      if (currentBoard) {
        const frontendIdea = {
          ...newIdea,
          id: newIdea.id,
          title: newIdea.title,
          description: newIdea.description,
          type: "ai",
          boardId: currentBoard.id,
          flowId: flowId,
          parentId: parentId,
          kanbanStatus: null,
          assignedTo: null,
          labels: [],
          idea_comments: [],
        };

        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: [...(prev.flowIdeas || []), frontendIdea],
        }));
      }
      return newIdea;
    } catch (error) {
      console.error("Error creating flow idea:", error);
      toast.error("Failed to create idea");
      throw error;
    }
  };

  const updateFlowIdea = async (ideaId, updates) => {
    try {
      // Optimistic update
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: prev.flowIdeas.map((idea) =>
            idea.id === ideaId ? { ...idea, ...updates } : idea
          ),
        }));
      }

      // Prepare backend updates
      const backendUpdates = { ...updates };

      if (backendUpdates.kanbanStatus !== undefined) {
        backendUpdates.kanban_status = backendUpdates.kanbanStatus;
        delete backendUpdates.kanbanStatus;
      }

      await flowService.updateIdea(ideaId, backendUpdates);
    } catch (error) {
      console.error("Error updating flow idea:", error);
      toast.error("Failed to update idea");
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  const deleteFlowIdea = async (ideaId) => {
    try {
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: prev.flowIdeas.filter((idea) => idea.id !== ideaId),
        }));
      }

      await flowService.deleteIdea(ideaId);
      toast.success("Idea deleted");
    } catch (error) {
      console.error("Error deleting flow idea:", error);
      toast.error("Failed to delete idea");
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  const toggleIdeaLike = async (ideaId) => {
    try {
      const idea = currentBoard?.flowIdeas.find((i) => i.id === ideaId);
      if (!idea) return;

      // Optimistic update
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: prev.flowIdeas.map((i) =>
            i.id === ideaId
              ? {
                  ...i,
                  is_liked: !i.is_liked,
                  is_disliked: false,
                }
              : i
          ),
        }));
      }

      await flowService.toggleIdeaLike(ideaId, idea.is_liked, authUser?.id);
    } catch (error) {
      console.error("Error toggling idea like:", error);
      toast.error("Failed to update reaction");
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  const toggleIdeaDislike = async (ideaId) => {
    try {
      const idea = currentBoard?.flowIdeas.find((i) => i.id === ideaId);
      if (!idea) return;

      // Optimistic update
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: prev.flowIdeas.map((i) =>
            i.id === ideaId
              ? {
                  ...i,
                  is_disliked: !i.is_disliked,
                  is_liked: false,
                }
              : i
          ),
        }));
      }

      await flowService.toggleIdeaDislike(
        ideaId,
        idea.is_disliked,
        authUser?.id
      );
    } catch (error) {
      console.error("Error toggling idea dislike:", error);
      toast.error("Failed to update reaction");
      if (currentBoard) fetchBoardDetails(currentBoard.id);
    }
  };

  // --- Member Operations ---

  const addMember = async (boardId, userId, role = "viewer") => {
    try {
      const newMember = await memberService.addMember(boardId, userId, role);

      // Update currentBoard if it's the same board
      if (currentBoard?.id === boardId) {
        setCurrentBoard((prev) => ({
          ...prev,
          members: [...(prev.members || []), newMember],
        }));
      }

      // Update boards list
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId
            ? { ...board, members: [...(board.members || []), newMember] }
            : board
        )
      );

      toast.success("Member added successfully");
      return newMember;
    } catch (error) {
      console.error("Error adding member:", error);
      if (error.code === "23505") {
        toast.error("User is already a member of this board");
      } else {
        toast.error("Failed to add member");
      }
      throw error;
    }
  };

  const updateMemberRole = async (boardId, userId, role) => {
    try {
      const updatedMember = await memberService.updateMemberRole(
        boardId,
        userId,
        role
      );

      // Update currentBoard if it's the same board
      if (currentBoard?.id === boardId) {
        setCurrentBoard((prev) => ({
          ...prev,
          members: prev.members.map((m) =>
            m.user?.id === userId ? { ...m, role } : m
          ),
        }));
      }

      // Update boards list
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId
            ? {
                ...board,
                members: board.members.map((m) =>
                  m.user?.id === userId ? { ...m, role } : m
                ),
              }
            : board
        )
      );

      toast.success("Member role updated");
      return updatedMember;
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error("Failed to update member role");
      throw error;
    }
  };

  const removeMember = async (boardId, userId) => {
    try {
      await memberService.removeMember(boardId, userId);

      // Update currentBoard if it's the same board
      if (currentBoard?.id === boardId) {
        setCurrentBoard((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m.user?.id !== userId),
        }));
      }

      // Update boards list
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId
            ? {
                ...board,
                members: board.members.filter((m) => m.user?.id !== userId),
              }
            : board
        )
      );

      toast.success("Member removed from board");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
      throw error;
    }
  };

  // --- AI Idea Comment Operations ---

  const addAiIdeaComment = async (aiIdeaId, text) => {
    try {
      if (!authUser) throw new Error("User not authenticated");

      const newComment = await aiIdeaCommentService.createComment(
        {
          ai_idea_id: aiIdeaId,
          text,
        },
        authUser.id
      );

      // Update currentBoard flowIdeas with the new comment
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: prev.flowIdeas.map((idea) =>
            idea.id === aiIdeaId
              ? {
                  ...idea,
                  idea_comments: [...(idea.idea_comments || []), newComment],
                }
              : idea
          ),
        }));
      }

      return newComment;
    } catch (error) {
      console.error("Error adding AI idea comment:", error);
      toast.error("Failed to add comment");
      throw error;
    }
  };

  const updateAiIdeaComment = async (commentId, text) => {
    try {
      const updatedComment = await aiIdeaCommentService.updateComment(
        commentId,
        text
      );

      // Update currentBoard flowIdeas with the updated comment
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: prev.flowIdeas.map((idea) => ({
            ...idea,
            idea_comments: (idea.idea_comments || []).map((comment) =>
              comment.id === commentId ? updatedComment : comment
            ),
          })),
        }));
      }

      toast.success("Comment updated");
      return updatedComment;
    } catch (error) {
      console.error("Error updating AI idea comment:", error);
      toast.error("Failed to update comment");
      throw error;
    }
  };

  const deleteAiIdeaComment = async (aiIdeaId, commentId) => {
    try {
      await aiIdeaCommentService.deleteComment(commentId);

      // Update currentBoard flowIdeas by removing the comment
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          flowIdeas: prev.flowIdeas.map((idea) =>
            idea.id === aiIdeaId
              ? {
                  ...idea,
                  idea_comments: (idea.idea_comments || []).filter(
                    (comment) => comment.id !== commentId
                  ),
                }
              : idea
          ),
        }));
      }

      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting AI idea comment:", error);
      toast.error("Failed to delete comment");
      throw error;
    }
  };

  // --- Card Comment Operations ---

  const addCardComment = async (cardId, text) => {
    try {
      if (!authUser) throw new Error("User not authenticated");

      const newComment = await commentService.createComment(
        {
          card_id: cardId,
          text,
        },
        authUser.id
      );

      // Update currentBoard cards with the new comment
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          cards: prev.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  comments: [...(card.comments || []), newComment],
                }
              : card
          ),
        }));
      }

      return newComment;
    } catch (error) {
      console.error("Error adding card comment:", error);
      toast.error("Failed to add comment");
      throw error;
    }
  };

  const updateCardComment = async (commentId, text) => {
    try {
      const updatedComment = await commentService.updateComment(
        commentId,
        text
      );

      // Update currentBoard cards with the updated comment
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          cards: prev.cards.map((card) => ({
            ...card,
            comments: (card.comments || []).map((comment) =>
              comment.id === commentId ? updatedComment : comment
            ),
          })),
        }));
      }

      toast.success("Comment updated");
      return updatedComment;
    } catch (error) {
      console.error("Error updating card comment:", error);
      toast.error("Failed to update comment");
      throw error;
    }
  };

  const deleteCardComment = async (cardId, commentId) => {
    try {
      await commentService.deleteComment(commentId);

      // Update currentBoard cards by removing the comment
      if (currentBoard) {
        setCurrentBoard((prev) => ({
          ...prev,
          cards: prev.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  comments: (card.comments || []).filter(
                    (comment) => comment.id !== commentId
                  ),
                }
              : card
          ),
        }));
      }

      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting card comment:", error);
      toast.error("Failed to delete comment");
      throw error;
    }
  };

  return (
    <BoardContext.Provider
      value={{
        boards,
        setBoards,
        currentBoard,
        loading,
        fetchBoards,
        fetchBoardDetails,
        createBoard,
        updateBoard,
        deleteBoard,
        archiveBoard,
        restoreBoard,
        duplicateBoard,
        toggleFavorite,
        createCard,
        updateCard,
        deleteCard,
        moveCard,
        createColumn,
        updateColumn,
        deleteColumn,
        updateColumnPositions,
        createFlow,
        createFlowIdea,
        updateFlowIdea,
        deleteFlowIdea,
        toggleIdeaLike,
        toggleIdeaDislike,
        addMember,
        updateMemberRole,
        removeMember,
        addAiIdeaComment,
        updateAiIdeaComment,
        deleteAiIdeaComment,
        addCardComment,
        updateCardComment,
        deleteCardComment,
        updateCurrentBoardCards,
        updateCurrentBoardFlowIdeas,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};

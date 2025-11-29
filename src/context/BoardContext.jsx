import { createContext, useContext, useState, useEffect } from "react";
import { boardService } from "../services/boardService";
import { cardService } from "../services/cardService";
import { columnService } from "../services/columnService";
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
          showInFlow: false,
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
          ideas: [...(prev.ideas || []), newIdea],
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
          ideas: prev.ideas.map((idea) =>
            idea.id === cardId ? { ...idea, ...updates } : idea
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
          ideas: prev.ideas.filter((idea) => idea.id !== cardId),
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
          ideas: prev.ideas.map((idea) =>
            idea.id === cardId
              ? { ...idea, kanbanStatus: newStatus, position: newPosition }
              : idea
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
        setCurrentBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === columnId ? { ...col, title } : col
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
          showInFlow: false,
          boardId: currentBoard.id,
          flowId: flowId,
          parentId: parentId,
          kanbanStatus: null,
          assignedTo: null,
          labels: [],
          comments: [],
        };

        setCurrentBoard((prev) => ({
          ...prev,
          ideas: [...(prev.ideas || []), frontendIdea],
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
          ideas: prev.ideas.map((idea) =>
            idea.id === ideaId ? { ...idea, ...updates } : idea
          ),
        }));
      }

      await flowService.updateIdea(ideaId, updates);
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
          ideas: prev.ideas.filter((idea) => idea.id !== ideaId),
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
        createFlowIdea,
        updateFlowIdea,
        deleteFlowIdea,
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

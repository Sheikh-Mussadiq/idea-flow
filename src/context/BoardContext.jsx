import { createContext, useContext, useState, useEffect } from "react";
import { mockBoards, mockCards, mockAIFlows, mockLabels, mockUsers } from "../data/mockData";
import { toast } from "sonner";

const BoardContext = createContext(null);

const defaultMembers = mockUsers.map(user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
}));

const createEmptyBoard = (name, color = "#6366f1", icon = "📝") => ({
  id: crypto.randomUUID(),
  name,
  color,
  icon,
  createdAt: Date.now(),
  ideas: [],
  comments: {},
  settings: {
    description: "",
    themeColor: color,
    icon,
    defaultLabels: mockLabels,
  },
  members: defaultMembers.map((member) => ({ ...member })),
  invites: [],
  activity: [],
  isArchived: false,
  isFavorite: false,
});

export const BoardProvider = ({ children }) => {
  // Initialize boards with mock data
  const [boards, setBoards] = useState(() => {
    return mockBoards.map(board => {
      // Get cards for this board
      const boardCards = mockCards.filter(card => card.boardId === board.id);
      
      // Get AI flow ideas for this board
      const boardFlow = mockAIFlows.find(flow => flow.boardId === board.id);
      const flowIdeas = boardFlow ? boardFlow.ideas : [];
      
      // Combine cards and AI flow ideas
      const allIdeas = [...boardCards, ...flowIdeas];
      
      return {
        ...board,
        ideas: allIdeas,
        comments: {},
        invites: [],
        activity: [],
        isArchived: board.isArchived || false,
      };
    });
  });

  const [activeBoardId, setActiveBoardId] = useState(() => boards[0]?.id);

  const activeBoard = boards.find(b => b.id === activeBoardId) || null;

  const selectBoard = (boardId) => {
    setActiveBoardId(boardId);
  };

  const createBoard = (name, description = "") => {
    const newBoard = createEmptyBoard(name);
    newBoard.settings.description = description;
    newBoard.activity.push({
      id: Date.now().toString(),
      timestamp: Date.now(),
      user: "You",
      action: "created this board",
      icon: "layout",
    });
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    toast.success(`Board "${name}" created`);
    return newBoard;
  };

  const updateBoard = (boardId, updates) => {
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, ...updates } : b));
  };

  const deleteBoard = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    setBoards(prev => {
      const filtered = prev.filter(b => b.id !== boardId);
      // If active board is deleted, switch to another one
      if (activeBoardId === boardId) {
        const nextBoard = filtered[0];
        if (nextBoard) setActiveBoardId(nextBoard.id);
      }
      return filtered;
    });
    toast.success(`Board "${board.name}" deleted`);
  };

  const archiveBoard = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    updateBoard(boardId, { 
      isArchived: true,
      activity: [
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          user: "You",
          action: "Archived board",
          icon: "archive",
        },
        ...(board.activity || [])
      ]
    });
    toast.success(`Board "${board.name}" archived`);
  };

  const restoreBoard = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    updateBoard(boardId, { 
      isArchived: false,
      activity: [
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          user: "You",
          action: "Restored board",
          icon: "refresh-ccw",
        },
        ...(board.activity || [])
      ]
    });
    toast.success(`Board "${board.name}" restored`);
  };

  const duplicateBoard = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const copy = {
      ...board,
      id: crypto.randomUUID(),
      name: `${board.name} Copy`,
      createdAt: Date.now(),
      ideas: board.ideas.map(idea => ({ ...idea, id: crypto.randomUUID() })),
      comments: { ...board.comments }, // Deep copy needed in real app
      activity: [...(board.activity || [])],
      isArchived: false,
    };

    setBoards(prev => [...prev, copy]);
    setActiveBoardId(copy.id);
    toast.success(`Board "${board.name}" duplicated`);
  };

  const toggleFavorite = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    updateBoard(boardId, { isFavorite: !board.isFavorite });
  };

  return (
    <BoardContext.Provider value={{
      boards,
      activeBoard,
      activeBoardId,
      selectBoard,
      createBoard,
      updateBoard,
      deleteBoard,
      archiveBoard,
      restoreBoard,
      duplicateBoard,
      toggleFavorite,
    }}>
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

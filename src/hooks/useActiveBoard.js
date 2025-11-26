import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useBoard } from "../context/BoardContext";

/**
 * Hook to get the active board based on URL params
 * Fetches board details if not already loaded or if ID changes
 */
export const useActiveBoard = () => {
  const { boardId } = useParams();
  const { currentBoard, fetchBoardDetails, loading } = useBoard();

  useEffect(() => {
    if (boardId) {
      // Only fetch if we don't have the board or it's a different one
      // We might want to refetch always to get fresh data, but for now let's avoid loops
      if (!currentBoard || currentBoard.id !== boardId) {
        fetchBoardDetails(boardId);
      }
    }
  }, [boardId, currentBoard?.id]); // Depend on ID match

  // If we are loading a new board, currentBoard might still be the old one or null
  // We should probably return null or loading state if IDs don't match
  const isActiveBoardLoaded = currentBoard && currentBoard.id === boardId;

  return {
    activeBoard: isActiveBoardLoaded ? currentBoard : null,
    boardId,
    isLoading: loading,
    notFound: boardId && !loading && !isActiveBoardLoaded,
  };
};

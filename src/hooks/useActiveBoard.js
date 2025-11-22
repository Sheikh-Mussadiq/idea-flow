import { useParams } from "react-router-dom";
import { useBoard } from "../context/BoardContext";

/**
 * Hook to get the active board based on URL params
 * Replaces the old activeBoardId state in BoardContext
 */
export const useActiveBoard = () => {
  const { boardId } = useParams();
  const { boards } = useBoard();
  
  const activeBoard = boards.find((b) => b.id === boardId);
  
  return {
    activeBoard,
    boardId,
    isLoading: false, // Can be extended for async board loading
    notFound: boardId && !activeBoard,
  };
};

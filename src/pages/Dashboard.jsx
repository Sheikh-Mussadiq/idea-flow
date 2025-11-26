import { useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { useBoard } from "../context/BoardContext";
import { Button } from "../components/ui/button";
import { Plus, Clock, Star, Archive } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { boards, createBoard } = useBoard();

  const activeBoards = boards.filter((b) => !b.isArchived);
  const favoriteBoards = activeBoards.filter((b) => b.isFavorite);
  const recentBoards = [...activeBoards]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  const handleCreateBoard = async () => {
    try {
      const newBoard = await createBoard("New Board", "");
      if (newBoard && newBoard.id) {
        navigate(`/boards/${newBoard.id}/flow`);
      }
    } catch (error) {
      // Error handled in context
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/boards/${boardId}/flow`);
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Welcome back! Here's an overview of your boards.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Button
              onClick={handleCreateBoard}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Board
            </Button>
          </div>

          {/* Favorite Boards */}
          {favoriteBoards.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-orange-400 fill-orange-400" />
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Favorite Boards
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onClick={() => handleBoardClick(board.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Boards */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Recent Boards
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onClick={() => handleBoardClick(board.id)}
                />
              ))}
            </div>
          </div>

          {/* All Boards */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              All Boards ({activeBoards.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onClick={() => handleBoardClick(board.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const BoardCard = ({ board, onClick }) => {
  const ideaCount = board.ideas?.length || 0;
  const memberCount = board.members?.length || 0;

  return (
    <button
      onClick={onClick}
      className="group relative bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all text-left"
    >
      {/* Board Icon & Name */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="text-3xl p-2 rounded-lg"
          style={{ backgroundColor: `${board.color}20` }}
        >
          {board.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate">
            {board.name}
          </h3>
          {board.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {board.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-1">
          <span className="font-medium">{ideaCount}</span>
          <span>ideas</span>
        </div>
        {memberCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {board.members?.slice(0, 3).map((member) => (
                <Avatar
                  key={member.id}
                  className="h-6 w-6 border-2 border-white dark:border-neutral-900"
                >
                  <AvatarFallback className="text-xs">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {memberCount > 3 && (
              <span className="text-xs">+{memberCount - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Favorite Badge */}
      {board.isFavorite && (
        <div className="absolute top-4 right-4">
          <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
        </div>
      )}

      {/* Hover Effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{ backgroundColor: board.color }}
      />
    </button>
  );
};

export default Dashboard;

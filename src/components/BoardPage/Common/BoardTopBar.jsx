import {
  Star,
  Search,
  MoreVertical,
  Filter,
  LayoutTemplate,
  Table2,
  List,
  GitFork,
  Plus,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { NotificationBell } from "../../Notifications/NotificationBell";
import { BoardActionsMenu } from "../Modals/BoardActionsMenu";
import { BoardActivityPanel } from "../Panels/BoardActivityPanel";
import { BoardSettingsModal } from "../Modals/BoardSettingsModal";
import { ShareBoardModal } from "../Modals/ShareBoardModal";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { TruncatedText } from "../../ui/TruncatedText";
import { useBoardPresence } from "../../../hooks/useBoardPresence";

export function BoardHeader({
  activeBoard,
  onOpenCreateBoard,
  onOpenSettings,
  onDuplicateBoard,
  onDeleteBoard,
  onArchiveBoard,
  onOpenMembers,
  onOpenFilters,
  currentUser,
  searchQuery,
  onChangeSearch,
  viewMode,
  onChangeViewMode,
  filters,
  onToggleFavorite,
}) {
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Track online users on this board
  const { onlineUsers } = useBoardPresence(activeBoard?.id);

  // Create a set of online user IDs for quick lookup
  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers]
  );

  if (!activeBoard) return null;

  const viewTabs = [
    { label: "Flow", value: "flow", icon: GitFork },
    { label: "Kanban", value: "kanban", icon: LayoutTemplate },
    // { label: "Table", value: "table", icon: Table2 },
    { label: "List", value: "list", icon: List },
  ];

  return (
    <div className="w-full bg-white dark:bg-neutral-950 px-6 pt-8 pb-2">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Title Area */}
        <div className="flex items-start gap-3 flex-1 min-w-0 mr-4 max-w-xl">
          <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl flex-shrink-0 mt-1">
            {activeBoard.icon || "🐳"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <TruncatedText
                as="h1"
                onClick={() => setIsSettingsOpen(true)}
                className="text-2xl font-bold text-neutral-900 dark:text-white cursor-pointer hover:opacity-70 transition-opacity truncate"
                title={activeBoard.name}
              >
                {activeBoard.name}
              </TruncatedText>
              <button
                onClick={onToggleFavorite}
                className={`transition-colors flex-shrink-0 ${
                  activeBoard.is_favorite
                    ? "text-yellow-400 hover:text-yellow-500"
                    : "text-neutral-400 dark:text-neutral-500 hover:text-yellow-400"
                }`}
              >
                <Star
                  className={`h-5 w-5 ${
                    activeBoard.is_favorite ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
            {activeBoard.description && (
              <TruncatedText
                as="p"
                onClick={() => setIsSettingsOpen(true)}
                className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors truncate"
                title={activeBoard.description}
              >
                {activeBoard.description}
              </TruncatedText>
            )}
          </div>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-4">
          {/* <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20"
          >
            <Plus className="h-5 w-5" />
          </Button> */}

          {/* Board Members - Online users shown first */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex -space-x-2 hover:opacity-80 transition-opacity"
            title={`${onlineUsers.length} user${
              onlineUsers.length !== 1 ? "s" : ""
            } online`}
          >
            {/* Show online users first (sorted by online status) */}
            {(() => {
              // Combine owner and members, mark online status
              const allUsers = [];

              if (activeBoard.owner) {
                allUsers.push({
                  id: activeBoard.owner.id,
                  full_name: activeBoard.owner.full_name,
                  avatar_url: activeBoard.owner.avatar_url,
                  isOwner: true,
                  isOnline: onlineUserIds.has(activeBoard.owner.id),
                });
              }

              (activeBoard.members || []).forEach((member) => {
                if (member.user?.id) {
                  allUsers.push({
                    id: member.user.id,
                    full_name: member.user.full_name,
                    avatar_url: member.user.avatar_url,
                    isOwner: false,
                    isOnline: onlineUserIds.has(member.user.id),
                  });
                }
              });

              // Sort: online users first
              allUsers.sort((a, b) => {
                if (a.isOnline && !b.isOnline) return -1;
                if (!a.isOnline && b.isOnline) return 1;
                return 0;
              });

              const displayUsers = allUsers.slice(0, 5);
              const remainingCount = allUsers.length - 5;

              return (
                <>
                  {displayUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="relative"
                      style={{
                        zIndex: user.isOnline
                          ? 10
                          : displayUsers.length - index,
                      }}
                    >
                      <Avatar
                        className={`h-8 w-8 border-2 border-white dark:border-neutral-950 ring-1 ring-neutral-100 dark:ring-neutral-800 ${
                          user.isOnline
                            ? "ring-2 ring-green-400 ring-offset-1"
                            : "opacity-75"
                        }`}
                      >
                        <AvatarImage
                          src={user.avatar_url}
                          className={!user.isOnline ? "grayscale-[30%]" : ""}
                        />
                        <AvatarFallback
                          className={`text-xs font-medium ${
                            user.isOwner
                              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                          }`}
                        >
                          {(user.full_name || "U")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator dot */}
                      <span
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 border-2 border-white dark:border-neutral-950 rounded-full ${
                          user.isOnline
                            ? "bg-green-500"
                            : "bg-neutral-400 dark:bg-neutral-600"
                        }`}
                      />
                    </div>
                  ))}
                  {/* Show +N if more users */}
                  {remainingCount > 0 && (
                    <div className="h-8 w-8 rounded-full border-2 border-white dark:border-neutral-950 ring-1 ring-neutral-100 dark:ring-neutral-800 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        +{remainingCount}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </button>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

          <NotificationBell />

          <button className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <Search className="h-5 w-5" />
          </button>

          <BoardActionsMenu
            trigger={
              <button className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            }
            onViewActivity={() => {
              setIsActivityOpen(true);
            }}
            onDuplicate={() => {
              onDuplicateBoard?.();
              toast.success(
                `Board "${activeBoard.name}" duplicated successfully!`
              );
            }}
            onArchive={() => {
              if (
                window.confirm(
                  `Are you sure you want to archive "${activeBoard.name}"?`
                )
              ) {
                onArchiveBoard?.();
                toast.success(`Board "${activeBoard.name}" archived`);
              }
            }}
            onDelete={() => {
              onDeleteBoard?.();
            }}
            onExport={() => {
              toast.success("Board exported as JSON");
              // Mock export
              const data = JSON.stringify(
                { board: activeBoard, timestamp: new Date().toISOString() },
                null,
                2
              );
              console.log("Exported data:", data);
            }}
            onSettings={() => {
              setIsSettingsOpen(true);
            }}
            onShare={() => {
              setIsShareOpen(true);
            }}
            onSaveAsTemplate={() => {
              toast.success(
                `Board saved as template: "${activeBoard.name} Template"`
              );
            }}
          />
        </div>
      </div>

      {/* Bottom Row (Tabs & Filter) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {viewTabs.map((tab) => {
            const isActive = viewMode === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onChangeViewMode?.(tab.value)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 gap-2 relative"
          onClick={onOpenFilters}
        >
          <Filter className="h-4 w-4" />
          Filter
          {(() => {
            const activeFilterCount =
              filters.priorities.length +
              filters.labelIds.length +
              filters.assigneeIds.length +
              filters.statuses.length +
              filters.types.length +
              (filters.dueDate ? 1 : 0);

            return activeFilterCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-900 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            ) : null;
          })()}
        </Button>
      </div>

      {/* Activity Panel */}
      <BoardActivityPanel
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      {/* Settings Modal */}
      <BoardSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        board={activeBoard}
      />

      {/* Share Modal */}
      <ShareBoardModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        board={activeBoard}
      />
    </div>
  );
}

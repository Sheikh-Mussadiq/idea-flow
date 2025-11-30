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
import { useState } from "react";

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
}) {
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

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
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
            {activeBoard.icon || "🐳"}
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {activeBoard.name}
          </h1>
          <button className="text-neutral-400 dark:text-neutral-500 hover:text-yellow-400 transition-colors">
            <Star className="h-5 w-5" />
          </button>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20"
          >
            <Plus className="h-5 w-5" />
          </Button>

          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Avatar
                key={i}
                className="h-8 w-8 border-2 border-white dark:border-neutral-950 ring-1 ring-neutral-100 dark:ring-neutral-800"
              >
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                <AvatarFallback>U{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>

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

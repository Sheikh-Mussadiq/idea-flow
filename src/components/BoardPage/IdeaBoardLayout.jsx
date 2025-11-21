import { useEffect, useMemo, useRef, useState } from "react";

import { FlowContent } from "./FlowContent.jsx";
import { ArchivedTasksPanel } from "./ArchivedTasksPanel.jsx";
import { BoardMembersSheet } from "./BoardMembersSheet.jsx";
import { BoardHeader } from "./BoardTopBar.jsx";
import { BoardFiltersSheet } from "./BoardFiltersSheet.jsx";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { mockUsers, mockLabels } from "../../data/mockData.js";
import { useBoard } from "../../context/BoardContext";

const defaultMembers = mockUsers.map(user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
}));

const createEmptyBoard = (name, color, icon) => ({
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
});

export const IdeaBoardLayout = ({ initialView = "flow" }) => {
  const { 
    boards, 
    activeBoard, 
    activeBoardId, 
    selectBoard, 
    createBoard, 
    updateBoard, 
    deleteBoard, 
    archiveBoard, 
    duplicateBoard 
  } = useBoard();

  // Local UI state
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(defaultMembers[0].id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [draftBoardName, setDraftBoardName] = useState("");
  const [draftBoardDescription, setDraftBoardDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [boardViewMode, setBoardViewMode] = useState(initialView);
  const [filters, setFilters] = useState({
    priorities: [],
    labelIds: [],
    assigneeIds: [],
    dueDate: null,
    statuses: [],
    types: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);


  const currentUser = useMemo(
    () =>
      defaultMembers.find((m) => m.id === currentUserId) ?? defaultMembers[0],
    [currentUserId]
  );

  const currentMemberRole = useMemo(() => {
    if (!activeBoard) return "viewer";
    const member = (activeBoard.members || []).find(
      (m) => m.id === currentUser.id
    );
    return member?.role || "viewer";
  }, [activeBoard, currentUser.id]);

  const isAdmin = currentMemberRole === "admin";
  const isViewer = currentMemberRole === "viewer";

  const availableLabels = useMemo(() => {
    if (!activeBoard) return [];
    const map = new Map();
    activeBoard.ideas.forEach((idea) => {
      (idea.labels || []).forEach((label) => {
        if (!map.has(label.id)) {
          map.set(label.id, label);
        }
      });
    });
    return Array.from(map.values());
  }, [activeBoard]);

  const availableAssignees = useMemo(() => {
    if (!activeBoard) return [];
    const map = new Map();
    activeBoard.ideas.forEach((idea) => {
      if (idea.assignedTo && !map.has(idea.assignedTo.id)) {
        map.set(idea.assignedTo.id, {
          id: idea.assignedTo.id,
          name: idea.assignedTo.name,
          avatar: idea.assignedTo.avatar,
        });
      }
    });
    return Array.from(map.values());
  }, [activeBoard]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setBoardViewMode(initialView);
  }, [initialView]);

  const handleSelectBoard = (id) => {
    setActiveBoardId(id);
  };

  const handleCreateBoard = () => {
    if (!draftBoardName.trim()) return;
    createBoard(draftBoardName.trim(), draftBoardDescription);
    setDraftBoardName("");
    setDraftBoardDescription("");
    setIsCreateOpen(false);
  };





  const handleRenameActiveBoard = () => {
    if (!activeBoard || !draftBoardName.trim() || !isAdmin) return;
    updateBoard(activeBoard.id, { 
      name: draftBoardName.trim(),
      settings: { ...activeBoard.settings, description: draftBoardDescription }
    });
    setIsSettingsOpen(false);
  };





  const handleUpdateIdeas = (updater) => {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoard.id
          ? {
              ...board,
              ideas: updater(board.ideas),
            }
          : board
      )
    );
  };

  const filteredIdeas = useMemo(() => {
    if (!activeBoard) return [];

    const baseIdeas = activeBoard.ideas.filter((idea) => !idea.isArchived);

    const applyFilters = (idea) => {
      if (
        filters.priorities.length &&
        (!idea.priority || !filters.priorities.includes(idea.priority))
      ) {
        return false;
      }

      if (
        filters.labelIds.length &&
        !(idea.labels || []).some((l) => filters.labelIds.includes(l.id))
      ) {
        return false;
      }

      if (
        filters.assigneeIds.length &&
        (!idea.assignedTo || !filters.assigneeIds.includes(idea.assignedTo.id))
      ) {
        return false;
      }

      if (
        filters.statuses.length &&
        (!idea.kanbanStatus || !filters.statuses.includes(idea.kanbanStatus))
      ) {
        return false;
      }

      if (filters.types.length && !filters.types.includes(idea.type)) {
        return false;
      }

      if (filters.dueDate) {
        const hasDueDate = !!idea.dueDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!hasDueDate) {
          if (filters.dueDate === "none") return true;
          return false;
        }

        const due = new Date(idea.dueDate);
        due.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (filters.dueDate === "overdue" && due < today) return true;
        if (filters.dueDate === "today" && diffDays === 0) return true;
        if (filters.dueDate === "week" && diffDays >= 0 && diffDays <= 7)
          return true;
        if (filters.dueDate === "none") return !hasDueDate;

        return false;
      }

      return true;
    };

    const matchesSearch = (idea) => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch;

      const commentsForIdea = activeBoard.comments[idea.id] || [];

      if (idea.title?.toLowerCase().includes(q)) return true;
      if (idea.description?.toLowerCase().includes(q)) return true;
      if ((idea.labels || []).some((l) => l.name.toLowerCase().includes(q)))
        return true;
      if ((idea.subtasks || []).some((s) => s.text.toLowerCase().includes(q)))
        return true;
      if (idea.assignedTo && idea.assignedTo.name.toLowerCase().includes(q))
        return true;
      if (commentsForIdea.some((c) => c.text.toLowerCase().includes(q)))
        return true;

      return false;
    };

    const afterFilter = baseIdeas.filter(applyFilters);
    const afterSearch = afterFilter.filter(matchesSearch);
    setSearchCount(afterSearch.length);
    return afterSearch;
  }, [activeBoard, debouncedSearch, filters]);

  const handleUpdateComments = (updater) => {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoard.id
          ? {
              ...board,
              comments: updater(board.comments),
            }
          : board
      )
    );
  };

  if (!activeBoard) {
    return null;
  }

  const archivedIdeas = useMemo(
    () =>
      activeBoard ? activeBoard.ideas.filter((idea) => idea.isArchived) : [],
    [activeBoard]
  );

  const handleRestoreTask = (id) => {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== activeBoard.id) return board;
        const ideas = board.ideas.map((idea) => {
          if (idea.id !== id) return idea;
          const nextStatus =
            idea.previousKanbanStatus ?? idea.kanbanStatus ?? "Backlog";
          return {
            ...idea,
            isArchived: false,
            archivedAt: undefined,
            kanbanStatus: nextStatus,
          };
        });
        return { ...board, ideas };
      })
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-50 overflow-hidden">
      <BoardHeader
        boards={boards}
        activeBoard={activeBoard}
        isAdmin={isAdmin}
        onSelectBoard={handleSelectBoard}
        onOpenCreateBoard={() => {
          setDraftBoardName("");
          setDraftBoardDescription("");
          setIsCreateOpen(true);
        }}
        onOpenSettings={() => {
          setDraftBoardName(activeBoard.name);
          setDraftBoardDescription(activeBoard.settings?.description ?? "");
          setIsSettingsOpen(true);
        }}
        onDuplicateBoard={() => duplicateBoard(activeBoard.id)}
        onArchiveBoard={() => archiveBoard(activeBoard.id)}
        onDeleteBoard={() => setIsDeleteConfirmOpen(true)}
        onOpenMembers={() => setIsMembersOpen(true)}
        currentUser={currentUser}
        currentMemberRole={currentMemberRole}
        defaultMembers={defaultMembers}
        onChangeUser={setCurrentUserId}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        searchInputRef={searchInputRef}
        searchCount={searchCount}
        onOpenFilters={() => setIsFilterOpen(true)}
        onOpenArchived={() => setIsArchivedOpen(true)}
        archivedCount={archivedIdeas.length}
        viewMode={boardViewMode}
        onChangeViewMode={setBoardViewMode}
        filters={filters}
      />

      <div className="flex-1 w-full overflow-hidden">
        <FlowContent
          initialView={initialView}
          ideas={filteredIdeas}
          comments={activeBoard.comments}
          onUpdateIdeas={handleUpdateIdeas}
          onUpdateComments={handleUpdateComments}
          teamMembers={activeBoard.members || []}
          currentUser={currentUser}
          currentRole={currentMemberRole}
          viewMode={boardViewMode}
          onChangeView={setBoardViewMode}
        />
      </div>

      <BoardFiltersSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        setFilters={setFilters}
        availableLabels={availableLabels}
        availableAssignees={availableAssignees}
      />

      <Sheet open={isArchivedOpen} onOpenChange={setIsArchivedOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Archived Tasks</SheetTitle>
            <SheetDescription className="text-xs">
              View and restore tasks that have been archived from this board.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 h-[70vh] overflow-hidden">
            <ArchivedTasksPanel
              ideas={archivedIdeas}
              onRestoreTask={handleRestoreTask}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new board</DialogTitle>
            <DialogDescription className="text-xs">
              Start a fresh workspace with its own flow view, kanban board, and
              activity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Board name</label>
              <Input
                autoFocus
                placeholder="e.g. Marketing Board"
                value={draftBoardName}
                onChange={(e) => setDraftBoardName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <Input
                placeholder="Optional description"
                value={draftBoardDescription}
                onChange={(e) => setDraftBoardDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateBoard}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Board settings</DialogTitle>
            <DialogDescription className="text-xs">
              Configure this workspace's name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Board name</label>
              <Input
                value={draftBoardName}
                onChange={(e) => setDraftBoardName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <Input
                value={draftBoardDescription}
                onChange={(e) => setDraftBoardDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleRenameActiveBoard}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this board?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete the workspace
              <span className="font-medium"> {activeBoard.name}</span> and all
              of its ideas, tasks, and activity. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-0"
              onClick={() => {
                deleteBoard(activeBoard.id);
                setIsDeleteConfirmOpen(false);
              }}
            >
              Delete Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";

import { BoardContent } from "../components/BoardPage/BoardContent.jsx";
import { ArchivedTasksPanel } from "../components/BoardPage/Panels/ArchivedTasksPanel.jsx";
import { BoardMembersSheet } from "../components/BoardPage/Modals/BoardMembersSheet.jsx";
import { BoardHeader } from "../components/BoardPage/Common/BoardTopBar.jsx";
import { BoardFiltersSheet } from "../components/BoardPage/Modals/BoardFiltersSheet.jsx";
import { Button } from "../components/ui/button";
import BoardNotFound from "../pages/BoardNotFound.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../components/ui/sheet";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useBoard } from "../context/BoardContext";
import { useActiveBoard } from "../hooks/useActiveBoard";
import { useAuth } from "../context/AuthContext";

export const IdeaBoardLayout = ({ initialView = "flow" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { flowId } = useParams(); // Get flowId from URL if present

  const {
    boards,
    setBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    archiveBoard,
    duplicateBoard,
    updateCurrentBoardCards,
    updateCurrentBoardFlowIdeas,
  } = useBoard();

  const { currentUser } = useAuth();

  // Use URL-based board selection
  const { activeBoard, boardId, notFound } = useActiveBoard();

  // Determine the active flow - use flowId from URL or default to first flow
  const activeFlowId = useMemo(() => {
    if (flowId) return flowId;
    return activeBoard?.ai_flows?.[0]?.id || null;
  }, [flowId, activeBoard?.ai_flows]);

  // Redirect to include flow ID in URL when on flow view without flowId
  useEffect(() => {
    if (notFound || !activeBoard || !boardId) return;
    
    // Wait for flows to be loaded
    if (!activeBoard.ai_flows || activeBoard.ai_flows.length === 0) return;
    
    // Don't redirect if we already have the correct flowId in URL
    if (flowId === activeFlowId) return;
    
    // Check if we're on a flow route (either /flow or /flow/:flowId)
    const isFlowRoute = location.pathname.includes('/flow');
    // Check if we're on the board index route (just /boards/:boardId)
    const isBoardIndexRoute = location.pathname === `/boards/${boardId}` || 
                              location.pathname === `/boards/${boardId}/`;
    
    // If we have flows and are on flow view (or board index which redirects to flow), redirect to include flow ID
    if (activeFlowId && (isFlowRoute || isBoardIndexRoute)) {
      const currentParams = searchParams.toString();
      const queryString = currentParams ? `?${currentParams}` : "";
      navigate(`/boards/${boardId}/flow/${activeFlowId}${queryString}`, { replace: true });
    }
  }, [flowId, activeFlowId, boardId, navigate, notFound, activeBoard, activeBoard?.ai_flows, searchParams, location.pathname]);

  // Local UI state
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [draftBoardName, setDraftBoardName] = useState("");
  const [draftBoardDescription, setDraftBoardDescription] = useState("");

  // Get search from URL params
  const searchQuery = searchParams.get("search") || "";
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [searchCount, setSearchCount] = useState(0);
  const [boardViewMode, setBoardViewMode] = useState(initialView);

  // Get filters from URL params
  const [filters, setFilters] = useState(() => ({
    priorities: searchParams.getAll("priority"),
    labelIds: searchParams.getAll("label"),
    assigneeIds: searchParams.getAll("assignee"),
    dueDate: searchParams.get("dueDate") || null,
    statuses: searchParams.getAll("status"),
    types: searchParams.getAll("type"),
  }));

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);


  // Check if current user is the board owner
  const isOwner =
    activeBoard && currentUser ? activeBoard.owner_id === currentUser.id : false;

  // Check current user's member role
  const currentMemberRole = useMemo(() => {
    if (!activeBoard || !currentUser) return null;
    const member = (activeBoard.members || []).find(
      (m) => m.user?.id === currentUser.id
    );
    return member?.role || null;
  }, [activeBoard, currentUser]);

  // User can edit if they are owner OR have editor role
  const canEdit = isOwner || currentMemberRole === "editor";
  const isViewer = !canEdit;

  const availableLabels = useMemo(() => {
    if (!activeBoard?.tags) return [];
    return [...activeBoard.tags];
  }, [activeBoard?.tags]);

  const availableAssignees = useMemo(() => {
    if (!activeBoard?.members) return [];
    return activeBoard.members
      .map((member) => ({
        id: member.user_id || member.user?.id,
        name: member.user?.full_name || member.user?.name,
        avatar: member.user?.avatar_url || member.user?.avatar,
        role: member.role,
      }))
      .filter(Boolean);
  }, [activeBoard?.members]);

  // Debounce search
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  // Sync filters from URL params
  useEffect(() => {
    setFilters({
      priorities: searchParams.getAll("priority"),
      labelIds: searchParams.getAll("label"),
      assigneeIds: searchParams.getAll("assignee"),
      dueDate: searchParams.get("dueDate") || null,
      statuses: searchParams.getAll("status"),
      types: searchParams.getAll("type"),
    });
  }, [searchParams]);

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

  // Handler to change view mode and update URL
  const handleChangeViewMode = (newViewMode) => {
    if (!activeBoard) return;
    setBoardViewMode(newViewMode);

    // Navigate to the new view URL while preserving search params
    const currentParams = searchParams.toString();
    const queryString = currentParams ? `?${currentParams}` : "";
    
    // If switching to flow view and we have an active flow ID, include it in URL
    if (newViewMode === "flow" && activeFlowId) {
      navigate(`/boards/${activeBoard.id}/flow/${activeFlowId}${queryString}`);
    } else {
      navigate(`/boards/${activeBoard.id}/${newViewMode}${queryString}`);
    }
  };

  // Handler to update search in URL
  const handleSearchChange = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    setSearchParams(params, { replace: true });
  };

  // Handler to update filters in URL
  const handleFiltersChange = (newFilters) => {
    const params = new URLSearchParams();

    // Add all filter params with safety checks
    (newFilters.priorities || []).forEach((p) => params.append("priority", p));
    (newFilters.labelIds || []).forEach((l) => params.append("label", l));
    (newFilters.assigneeIds || []).forEach((a) => params.append("assignee", a));
    (newFilters.statuses || []).forEach((s) => params.append("status", s));
    (newFilters.types || []).forEach((t) => params.append("type", t));
    if (newFilters.dueDate) params.set("dueDate", newFilters.dueDate);

    // Preserve search param
    const search = searchParams.get("search");
    if (search) params.set("search", search);

    setSearchParams(params, { replace: true });
    setFilters(newFilters);
  };

  const handleCreateBoard = async () => {
    if (!draftBoardName.trim()) return;
    try {
      const newBoard = await createBoard(
        draftBoardName.trim(),
        draftBoardDescription
      );
      setDraftBoardName("");
      setDraftBoardDescription("");
      setIsCreateOpen(false);
      navigate(`/boards/${newBoard.id}/flow`);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleRenameActiveBoard = async () => {
    if (!activeBoard || !draftBoardName.trim() || !isOwner) return;
    try {
      await updateBoard(activeBoard.id, {
        name: draftBoardName.trim(),
        settings: {
          ...activeBoard.settings,
          description: draftBoardDescription,
        },
      });
      setIsSettingsOpen(false);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleUpdateIdeas = (updater) => {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoard.id
          ? {
              ...board,
              ideas: updater(board.ideas || []),
            }
          : board
      )
    );
  };

  const handleUpdateCards = (updater) => {
    updateCurrentBoardCards(updater);
  };

  const handleUpdateFlowIdeas = (updater) => {
    updateCurrentBoardFlowIdeas(updater);
  };

  // Use the already-flattened cards and flowIdeas from boardService
  const allCards = useMemo(() => {
    return activeBoard?.cards || [];
  }, [activeBoard?.cards]);

  // Use the already-flattened flowIdeas from boardService
  const allIdeas = useMemo(() => {
    return activeBoard?.flowIdeas || [];
  }, [activeBoard?.flowIdeas]);

  const filterItems = (items) => {
    if (!items || !items.length) return [];

    const q = debouncedSearch;
    const { priorities, labelIds, assigneeIds, dueDate, statuses, types } =
      filters;

    const applyFilters = (item) => {
      // Filter by priority
      if (priorities.length > 0 && !priorities.includes(item.priority)) {
        return false;
      }

      // Filter by labels
      if (
        labelIds.length > 0 &&
        !labelIds.some(
          (id) =>
            (item.tags || []).includes(id) ||
            (item.labels || []).some((label) => label.id === id)
        )
      ) {
        return false;
      }

      // Filter by assignees
      if (
        assigneeIds.length > 0 &&
        !assigneeIds.some(
          (id) =>
            (item.assigned_to || []).includes(id) || item.assignedTo?.id === id
        )
      ) {
        return false;
      }

      // Filter by status
      if (
        statuses.length > 0 &&
        !statuses.includes(item.status || item.kanbanStatus)
      ) {
        return false;
      }

      // Filter by type
      if (types.length > 0 && !types.includes(item.type)) {
        return false;
      }

      // Filter by due date
      if (dueDate && item.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(item.dueDate);
        const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

        if (dueDate === "overdue" && diffDays >= 0) return false;
        if (dueDate === "today" && diffDays !== 0) return false;
        if (dueDate === "week" && (diffDays < 0 || diffDays > 7)) return false;
        if (dueDate === "none" && item.dueDate) return false;
      } else if (dueDate && dueDate !== "none") {
        return false;
      }

      return true;
    };

    const matchesSearch = (item) => {
      if (!q) return true;
      const searchStr = q.toLowerCase();

      // Check title and description
      if (
        item.title?.toLowerCase().includes(searchStr) ||
        item.description?.toLowerCase().includes(searchStr)
      ) {
        return true;
      }

      // Check labels
      if (
        (item.labels || []).some((l) =>
          l.name?.toLowerCase().includes(searchStr)
        )
      ) {
        return true;
      }

      // Check assignees
      if (item.assignedTo?.name?.toLowerCase().includes(searchStr)) {
        return true;
      }

      return false;
    };

    const afterFilter = items.filter(applyFilters);
    const afterSearch = afterFilter.filter(matchesSearch);
    return afterSearch;
  };

  const filteredCards = useMemo(
    () => filterItems(allCards),
    [allCards, debouncedSearch, filters]
  );

  const filteredFlowIdeas = useMemo(
    () => filterItems(allIdeas),
    [allIdeas, debouncedSearch, filters]
  );

  useEffect(() => {
    setSearchCount(filteredCards.length + filteredFlowIdeas.length);
  }, [filteredCards.length, filteredFlowIdeas.length]);

  const handleUpdateComments = (updater) => {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoard.id
          ? {
              ...board,
              comments: updater(board.comments || {}),
            }
          : board
      )
    );
  };

  // Move useMemo before early returns to comply with Rules of Hooks
  const archivedIdeas = useMemo(() => {
    if (!activeBoard?.columns) return [];
    // Get all archived cards from all columns
    const archived = activeBoard.columns.flatMap((column) =>
      (column.cards || []).filter((card) => card.isArchived)
    );
    // Also include archived ideas from flows
    const archivedIdeasFromFlows =
      activeBoard.ai_flows?.flatMap((flow) =>
        (flow.ideas || []).filter((idea) => idea.isArchived)
      ) || [];
    return [...archived, ...archivedIdeasFromFlows];
  }, [activeBoard?.columns, activeBoard?.ai_flows]);

  if (notFound) {
    return <BoardNotFound />;
  }

  if (!activeBoard) {
    return null;
  }

  const handleRestoreTask = (id) => {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== activeBoard.id) return board;

        // Create a deep copy of the board
        const updatedBoard = { ...board };
        let found = false;

        // Try to find and restore the card in columns
        if (updatedBoard.columns) {
          updatedBoard.columns = updatedBoard.columns.map((column) => {
            const cardIndex = (column.cards || []).findIndex(
              (card) => card.id === id
            );
            if (cardIndex === -1) return column;

            found = true;
            const updatedColumn = { ...column };
            const updatedCards = [...(updatedColumn.cards || [])];
            const cardToRestore = updatedCards[cardIndex];

            updatedCards[cardIndex] = {
              ...cardToRestore,
              isArchived: false,
              archivedAt: undefined,
              kanbanStatus:
                cardToRestore.previousKanbanStatus ||
                cardToRestore.kanbanStatus ||
                "Backlog",
              previousKanbanStatus: undefined,
            };

            return {
              ...updatedColumn,
              cards: updatedCards,
            };
          });
        }

        // If not found in cards, try to find in ideas
        if (!found && updatedBoard.ai_flows) {
          updatedBoard.ai_flows = updatedBoard.ai_flows.map((flow) => {
            const ideaIndex = (flow.ideas || []).findIndex(
              (idea) => idea.id === id
            );
            if (ideaIndex === -1) return flow;

            const updatedFlow = { ...flow };
            const updatedIdeas = [...(updatedFlow.ideas || [])];

            updatedIdeas[ideaIndex] = {
              ...updatedIdeas[ideaIndex],
              isArchived: false,
              archivedAt: undefined,
            };

            return {
              ...updatedFlow,
              ideas: updatedIdeas,
            };
          });
        }

        return updatedBoard;
      })
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-50 overflow-hidden">
      <BoardHeader
        boards={boards}
        activeBoard={activeBoard}
        isOwner={isOwner}
        canEdit={canEdit}
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
        onDuplicateBoard={() => {
          const duplicated = duplicateBoard(activeBoard.id);
          if (duplicated) navigate(`/boards/${duplicated.id}/flow`);
        }}
        onArchiveBoard={() => {
          archiveBoard(activeBoard.id);
          navigate("/");
        }}
        onDeleteBoard={() => setIsDeleteConfirmOpen(true)}
        onOpenMembers={() => setIsMembersOpen(true)}
        currentUser={currentUser}
        currentMemberRole={currentMemberRole}
        searchQuery={searchQuery}
        onChangeSearch={handleSearchChange}
        searchInputRef={searchInputRef}
        searchCount={searchCount}
        onOpenFilters={() => setIsFilterOpen(true)}
        onOpenArchived={() => setIsArchivedOpen(true)}
        archivedCount={archivedIdeas.length}
        viewMode={boardViewMode}
        onChangeViewMode={handleChangeViewMode}
        filters={filters}
      />

      <div className="flex-1 w-full overflow-hidden">
        <BoardContent
          initialView={initialView}
          cards={filteredCards}
          flowIdeas={filteredFlowIdeas}
          columns={activeBoard.columns || []}
          comments={activeBoard.comments || {}}
          onUpdateCards={handleUpdateCards}
          onUpdateFlowIdeas={handleUpdateFlowIdeas}
          onUpdateComments={handleUpdateComments}
          teamMembers={activeBoard.members || []}
          currentUser={currentUser}
          currentRole={currentMemberRole}
          viewMode={boardViewMode}
          onChangeView={handleChangeViewMode}
          activeFlowId={activeFlowId}
        />
      </div>

      <BoardFiltersSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        setFilters={handleFiltersChange}
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
                navigate("/");
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

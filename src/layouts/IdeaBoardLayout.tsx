import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Filter, LayoutTemplate, Search } from "lucide-react";

import { FlowContent, type Idea, type Comment } from "@/components/FlowContent";
import { ArchivedTasksPanel } from "@/components/ArchivedTasksPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { KanbanStatus } from "@/components/KanbanBoard";
import { cn } from "@/lib/utils";

export interface BoardSettings {
  description?: string;
  defaultLabels?: { id: string; name: string; color: string }[];
  themeColor?: string;
  icon?: string;
}

export interface Board {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
  ideas: Idea[];
  comments: { [key: string]: Comment[] };
  settings?: BoardSettings;
}

interface BoardFilters {
  priorities: ("low" | "medium" | "high")[];
  labelIds: string[];
  assigneeIds: string[];
  dueDate: "overdue" | "today" | "week" | "none" | null;
  statuses: KanbanStatus[];
  types: ("ai" | "manual")[];
}

const createEmptyBoard = (
  name: string,
  color?: string,
  icon?: string
): Board => ({
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
    defaultLabels: [],
  },
});

export const IdeaBoardLayout = () => {
  const [boards, setBoards] = useState<Board[]>([
    createEmptyBoard("Main Content Board", "#6366f1", ""),
    createEmptyBoard("Marketing Board", "#22c55e"),
  ]);

  const [activeBoardId, setActiveBoardId] = useState<string>(
    () => boards[0]?.id
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [draftBoardName, setDraftBoardName] = useState("");
  const [draftBoardDescription, setDraftBoardDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [filters, setFilters] = useState<BoardFilters>({
    priorities: [],
    labelIds: [],
    assigneeIds: [],
    dueDate: null,
    statuses: [],
    types: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) ?? boards[0] ?? null,
    [boards, activeBoardId]
  );

  const availableLabels = useMemo(() => {
    if (!activeBoard)
      return [] as { id: string; name: string; color: string }[];
    const map = new Map<string, { id: string; name: string; color: string }>();
    activeBoard.ideas.forEach((idea) => {
      idea.labels.forEach((label) => {
        if (!map.has(label.id)) {
          map.set(label.id, label);
        }
      });
    });
    return Array.from(map.values());
  }, [activeBoard]);

  const availableAssignees = useMemo(() => {
    if (!activeBoard)
      return [] as { id: string; name: string; avatar?: string }[];
    const map = new Map<
      string,
      { id: string; name: string; avatar?: string }
    >();
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

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelectBoard = (id: string) => {
    setActiveBoardId(id);
  };

  const handleCreateBoard = () => {
    if (!draftBoardName.trim()) return;
    const newBoard = createEmptyBoard(draftBoardName.trim());
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    setDraftBoardName("");
    setDraftBoardDescription("");
    setIsCreateOpen(false);
  };

  const handleDuplicateBoard = () => {
    if (!activeBoard) return;
    const copy: Board = {
      ...activeBoard,
      id: crypto.randomUUID(),
      name: `${activeBoard.name} Copy`,
      createdAt: Date.now(),
      ideas: activeBoard.ideas.map((idea) => ({ ...idea })),
      comments: Object.fromEntries(
        Object.entries(activeBoard.comments).map(([key, value]) => [
          key,
          value.map((c) => ({ ...c })),
        ])
      ),
    };

    setBoards((prev) => [...prev, copy]);
    setActiveBoardId(copy.id);
  };

  const handleDeleteBoard = () => {
    if (!activeBoard) return;

    setBoards((prev) => {
      const filtered = prev.filter((b) => b.id !== activeBoard.id);
      if (!filtered.length) {
        const fallback = createEmptyBoard("Main Content Board");
        setActiveBoardId(fallback.id);
        return [fallback];
      }
      const nextActive =
        filtered.find((b) => b.id === activeBoardId) ?? filtered[0];
      setActiveBoardId(nextActive.id);
      return filtered;
    });

    setIsDeleteConfirmOpen(false);
  };

  const handleRenameActiveBoard = () => {
    if (!activeBoard || !draftBoardName.trim()) return;
    const nextName = draftBoardName.trim();
    setBoards((prev) =>
      prev.map((b) => (b.id === activeBoard.id ? { ...b, name: nextName } : b))
    );
    setIsSettingsOpen(false);
  };

  const handleUpdateIdeas = (updater: (prev: Idea[]) => Idea[]) => {
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
    if (!activeBoard) return [] as Idea[];

    const baseIdeas = activeBoard.ideas.filter((idea) => !idea.isArchived);

    const applyFilters = (idea: Idea) => {
      if (
        filters.priorities.length &&
        (!idea.priority || !filters.priorities.includes(idea.priority))
      ) {
        return false;
      }

      if (
        filters.labelIds.length &&
        !idea.labels.some((l) => filters.labelIds.includes(l.id))
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

        const due = new Date(idea.dueDate as string);
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

    const matchesSearch = (idea: Idea) => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch;

      const comments = activeBoard.comments[idea.id] || [];

      if (idea.title.toLowerCase().includes(q)) return true;
      if (idea.description.toLowerCase().includes(q)) return true;
      if (idea.labels.some((l) => l.name.toLowerCase().includes(q)))
        return true;
      if (idea.subtasks.some((s) => s.text.toLowerCase().includes(q)))
        return true;
      if (idea.assignedTo && idea.assignedTo.name.toLowerCase().includes(q))
        return true;
      if (comments.some((c) => c.text.toLowerCase().includes(q))) return true;

      return false;
    };

    const afterFilter = baseIdeas.filter(applyFilters);
    const afterSearch = afterFilter.filter(matchesSearch);
    setSearchCount(afterSearch.length);
    return afterSearch;
  }, [activeBoard, debouncedSearch, filters]);

  const handleUpdateComments = (
    updater: (prev: { [key: string]: Comment[] }) => {
      [key: string]: Comment[];
    }
  ) => {
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

  const handleRestoreTask = (id: string) => {
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
    <div className="relative h-full w-full bg-background">
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full border-border/70 bg-card/90 px-3 text-xs shadow-soft"
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  activeBoard.color ? "" : "bg-primary"
                )}
                style={
                  activeBoard.color
                    ? { backgroundColor: activeBoard.color }
                    : undefined
                }
              />
              <span className="flex items-center gap-1">
                <LayoutTemplate className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[140px] truncate">
                  {activeBoard.name}
                </span>
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[220px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            {boards.map((board) => (
              <DropdownMenuItem
                key={board.id}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  board.id === activeBoard.id && "bg-accent/60"
                )}
                onClick={() => handleSelectBoard(board.id)}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={
                    board.color ? { backgroundColor: board.color } : undefined
                  }
                />
                <span className="truncate">{board.name}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                setDraftBoardName("");
                setDraftBoardDescription("");
                setIsCreateOpen(true);
              }}
            >
              + Create New Board
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                setDraftBoardName(activeBoard.name);
                setDraftBoardDescription(
                  activeBoard.settings?.description ?? ""
                );
                setIsSettingsOpen(true);
              }}
            >
              Board Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onClick={handleDuplicateBoard}
            >
              Duplicate Board
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-red-500 focus:text-red-500"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Delete Board
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3 py-1 shadow-soft">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="h-7 w-40 border-0 bg-transparent px-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <span className="text-[10px] text-muted-foreground">
            {searchCount} results
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-border/70 bg-card/90 px-2 text-xs shadow-soft flex items-center gap-1"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="h-3 w-3" />
          Filter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-border/70 bg-card/90 px-2 text-xs shadow-soft"
          onClick={() => setIsArchivedOpen(true)}
        >
          Archived Tasks ({archivedIdeas.length})
        </Button>
      </div>

      {(filters.priorities.length > 0 ||
        filters.labelIds.length > 0 ||
        filters.assigneeIds.length > 0 ||
        filters.dueDate !== null ||
        filters.statuses.length > 0 ||
        filters.types.length > 0) && (
        <div className="absolute right-4 top-14 z-20 flex flex-wrap gap-2">
          {filters.priorities.map((p) => (
            <Button
              key={`priority-${p}`}
              type="button"
              size="sm"
              variant="outline"
              className="h-6 rounded-full px-2 text-[10px] flex items-center gap-1"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  priorities: prev.priorities.filter((x) => x !== p),
                }))
              }
            >
              <span className="font-medium">Priority:</span>
              <span className="capitalize">{p}</span>
              <span className="text-xs">×</span>
            </Button>
          ))}

          {filters.statuses.map((status) => (
            <Button
              key={`status-${status}`}
              type="button"
              size="sm"
              variant="outline"
              className="h-6 rounded-full px-2 text-[10px] flex items-center gap-1"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  statuses: prev.statuses.filter((s) => s !== status),
                }))
              }
            >
              <span className="font-medium">Status:</span>
              <span>{status}</span>
              <span className="text-xs">×</span>
            </Button>
          ))}

          {filters.types.map((t) => (
            <Button
              key={`type-${t}`}
              type="button"
              size="sm"
              variant="outline"
              className="h-6 rounded-full px-2 text-[10px] flex items-center gap-1"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  types: prev.types.filter((x) => x !== t),
                }))
              }
            >
              <span className="font-medium">Type:</span>
              <span>{t === "ai" ? "AI" : "Manual"}</span>
              <span className="text-xs">×</span>
            </Button>
          ))}

          {filters.labelIds.map((id) => {
            const label = availableLabels.find((l) => l.id === id);
            if (!label) return null;
            return (
              <Button
                key={`label-${id}`}
                type="button"
                size="sm"
                variant="outline"
                className="h-6 rounded-full px-2 text-[10px] flex items-center gap-1"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    labelIds: prev.labelIds.filter((x) => x !== id),
                  }))
                }
              >
                <span className="font-medium">Label:</span>
                <span>{label.name}</span>
                <span className="text-xs">×</span>
              </Button>
            );
          })}

          {filters.assigneeIds.map((id) => {
            const member = availableAssignees.find((m) => m.id === id);
            if (!member) return null;
            return (
              <Button
                key={`assignee-${id}`}
                type="button"
                size="sm"
                variant="outline"
                className="h-6 rounded-full px-2 text-[10px] flex items-center gap-1"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    assigneeIds: prev.assigneeIds.filter((x) => x !== id),
                  }))
                }
              >
                <span className="font-medium">Assigned:</span>
                <span>{member.name}</span>
                <span className="text-xs">×</span>
              </Button>
            );
          })}

          {filters.dueDate && (
            <Button
              key="dueDate"
              type="button"
              size="sm"
              variant="outline"
              className="h-6 rounded-full px-2 text-[10px] flex items-center gap-1"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  dueDate: null,
                }))
              }
            >
              <span className="font-medium">Due:</span>
              <span>
                {filters.dueDate === "overdue"
                  ? "Overdue"
                  : filters.dueDate === "today"
                  ? "Today"
                  : filters.dueDate === "week"
                  ? "This week"
                  : "No date"}
              </span>
              <span className="text-xs">×</span>
            </Button>
          )}
        </div>
      )}

      <div className="h-full w-full">
        <FlowContent
          ideas={filteredIdeas}
          comments={activeBoard.comments}
          onUpdateIdeas={handleUpdateIdeas}
          onUpdateComments={handleUpdateComments}
        />
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription className="text-xs">
              Narrow down tasks by priority, status, and type. (Labels,
              assignees, and due date can be added here next.)
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4 text-xs">
            <div className="space-y-2">
              <div className="font-medium">Priority</div>
              <div className="flex flex-wrap gap-2">
                {(["low", "medium", "high"] as const).map((p) => {
                  const active = filters.priorities.includes(p);
                  return (
                    <Button
                      key={p}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="h-7 rounded-full px-2 text-[11px] flex items-center gap-1"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          priorities: active
                            ? prev.priorities.filter((x) => x !== p)
                            : [...prev.priorities, p],
                        }));
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            p === "low"
                              ? "#22c55e"
                              : p === "medium"
                              ? "#eab308"
                              : "#ef4444",
                        }}
                      />
                      <span className="capitalize">{p}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Status</div>
              <div className="flex flex-wrap gap-2">
                {(
                  ["Backlog", "In Progress", "Review", "Done"] as KanbanStatus[]
                ).map((status) => {
                  const active = filters.statuses.includes(status);
                  return (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="h-7 rounded-full px-2 text-[11px]"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          statuses: active
                            ? prev.statuses.filter((s) => s !== status)
                            : [...prev.statuses, status],
                        }));
                      }}
                    >
                      {status}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Labels</div>
              <div className="flex flex-wrap gap-2">
                {availableLabels.length === 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    No labels yet
                  </span>
                )}
                {availableLabels.map((label) => {
                  const active = filters.labelIds.includes(label.id);
                  return (
                    <Button
                      key={label.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="h-7 rounded-full px-2 text-[11px] flex items-center gap-1"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          labelIds: active
                            ? prev.labelIds.filter((id) => id !== label.id)
                            : [...prev.labelIds, label.id],
                        }));
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span>{label.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Assigned to</div>
              <div className="flex flex-wrap gap-2">
                {availableAssignees.length === 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    No assignments yet
                  </span>
                )}
                {availableAssignees.map((member) => {
                  const active = filters.assigneeIds.includes(member.id);
                  return (
                    <Button
                      key={member.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="h-7 rounded-full px-2 text-[11px] flex items-center gap-1"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          assigneeIds: active
                            ? prev.assigneeIds.filter((id) => id !== member.id)
                            : [...prev.assigneeIds, member.id],
                        }));
                      }}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-medium">
                        {member.avatar || member.name.charAt(0)}
                      </span>
                      <span>{member.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Due date</div>
              <div className="flex flex-wrap gap-2">
                {(["overdue", "today", "week", "none"] as const).map(
                  (option) => {
                    const active = filters.dueDate === option;
                    const label =
                      option === "overdue"
                        ? "Overdue"
                        : option === "today"
                        ? "Due today"
                        : option === "week"
                        ? "Due this week"
                        : "No due date";
                    return (
                      <Button
                        key={option}
                        type="button"
                        size="sm"
                        variant={active ? "default" : "outline"}
                        className="h-7 rounded-full px-2 text-[11px]"
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            dueDate: active ? null : option,
                          }));
                        }}
                      >
                        {label}
                      </Button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Task type</div>
              <div className="flex flex-wrap gap-2">
                {(["ai", "manual"] as const).map((t) => {
                  const active = filters.types.includes(t);
                  return (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="h-7 rounded-full px-2 text-[11px]"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          types: active
                            ? prev.types.filter((x) => x !== t)
                            : [...prev.types, t],
                        }));
                      }}
                    >
                      {t === "ai" ? "AI-generated" : "Manual"}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-[11px]"
                onClick={() => {
                  setFilters({
                    priorities: [],
                    labelIds: [],
                    assigneeIds: [],
                    dueDate: null,
                    statuses: [],
                    types: [],
                  });
                }}
              >
                Clear all filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
              Configure this workspaces name and description.
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
              This will permanently delete the workspace{" "}
              <span className="font-medium">{activeBoard.name}</span> and all of
              its ideas, tasks, and activity. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeleteBoard}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

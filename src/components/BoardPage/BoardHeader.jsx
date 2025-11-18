import { ChevronDown, LayoutTemplate, Users } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function BoardHeader({
  boards,
  activeBoard,
  isAdmin,
  onSelectBoard,
  onOpenCreateBoard,
  onOpenSettings,
  onDuplicateBoard,
  onDeleteBoard,
  onOpenMembers,
}) {
  if (!activeBoard) return null;

  return (
    <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full border-border/70 bg-card/90 px-3 text-xs shadow-soft"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  activeBoard.color ? "" : "bg-primary"
                }`}
                style={
                  activeBoard.color
                    ? { backgroundColor: activeBoard.color }
                    : undefined
                }
              />
              <span className="flex items.center gap-1">
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
                className={`flex items-center gap-2 text-xs ${
                  board.id === activeBoard.id ? "bg-accent/60" : ""
                }`}
                onClick={() => onSelectBoard(board.id)}
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

            <DropdownMenuItem className="text-xs" onClick={onOpenCreateBoard}>
              + Create New Board
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {isAdmin && (
              <DropdownMenuItem className="text-xs" onClick={onOpenSettings}>
                Board Settings
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem className="text-xs" onClick={onDuplicateBoard}>
                Duplicate Board
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem
                className="text-xs text-red-500 focus:text-red-500"
                onClick={onDeleteBoard}
              >
                Delete Board
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border/70 bg-card/90 px-2 text-[11px] shadow-soft flex items-center gap-1"
            onClick={onOpenMembers}
          >
            <Users className="h-3 w-3" />
            Manage Members
          </Button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1">
        {(activeBoard.members || []).map((member) => (
          <div key={member.id} className="relative group">
            <Avatar className="h-6 w-6 border border-border/60">
              <AvatarFallback className="bg-primary/10 text-[10px] font-medium">
                {member.avatar || member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
        {isAdmin && (
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full border-dashed border-border/70 text-[10px] text-muted-foreground"
            onClick={onOpenMembers}
          >
            +
          </Button>
        )}
      </div>
    </div>
  );
}

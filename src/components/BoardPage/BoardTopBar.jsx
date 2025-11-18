import { Filter, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function BoardTopBar({
  currentUser,
  currentMemberRole,
  defaultMembers,
  onChangeUser,
  searchQuery,
  onChangeSearch,
  searchInputRef,
  searchCount,
  onOpenFilters,
  onOpenArchived,
  archivedCount,
}) {
  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border/70 bg-card/90 px-2 text-xs shadow-soft flex items-center gap-2"
          >
            <Avatar className="h-5 w-5 border border-border/60">
              <AvatarFallback className="bg-primary/10 text-[10px] font-medium">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[120px] truncate">{currentUser.name}</span>
            <span className="text-[10px] capitalize text-muted-foreground">
              {currentMemberRole}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Switch user
          </DropdownMenuLabel>
          {defaultMembers.map((user) => (
            <DropdownMenuItem
              key={user.id}
              className="flex items-center gap-2 text-xs"
              onClick={() => onChangeUser(user.id)}
            >
              <Avatar className="h-5 w-5 border border-border/60">
                <AvatarFallback className="bg-primary/10 text-[10px] font-medium">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{user.name}</span>
              <span className="text-[10px] capitalize text-muted-foreground">
                {user.role}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3 py-1 shadow-soft">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
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
        onClick={onOpenFilters}
      >
        <Filter className="h-3 w-3" />
        Filter
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-border/70 bg-card/90 px-2 text-xs shadow-soft"
        onClick={onOpenArchived}
      >
        Archived Tasks ({archivedCount})
      </Button>
    </div>
  );
}

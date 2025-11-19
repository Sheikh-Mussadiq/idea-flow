import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";

export function BoardFiltersSheet({
  open,
  onOpenChange,
  filters,
  setFilters,
  availableLabels,
  availableAssignees,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="text-xs">
            Narrow down tasks by priority, status, and type. (Labels, assignees,
            and due date can be added here next.)
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 text-xs">
          <div className="space-y-2">
            <div className="font-medium">Priority</div>
            <div className="flex flex-wrap gap-2">
              {["low", "medium", "high"].map((p) => {
                const active = filters.priorities.includes(p);
                return (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 rounded-full px-2 text-xs flex items-center gap-1"
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
              {["Backlog", "In Progress", "Review", "Done"].map((status) => {
                const active = filters.statuses.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 rounded-full px-2 text-xs"
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
                <span className="text-xs text-neutral-500">No labels yet</span>
              )}
              {availableLabels.map((label) => {
                const active = filters.labelIds.includes(label.id);
                return (
                  <Button
                    key={label.id}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 rounded-full px-2 text-xs flex items-center gap-1"
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
                <span className="text-xs text-neutral-500">
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
                    className="h-7 rounded-full px-2 text-xs flex items-center gap-1"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        assigneeIds: active
                          ? prev.assigneeIds.filter((id) => id !== member.id)
                          : [...prev.assigneeIds, member.id],
                      }));
                    }}
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-medium">
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
              {["overdue", "today", "week", "none"].map((option) => {
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
                    className="h-7 rounded-full px-2 text-xs"
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
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Task type</div>
            <div className="flex flex-wrap gap-2">
              {["ai", "manual"].map((t) => {
                const active = filters.types.includes(t);
                return (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 rounded-full px-2 text-xs"
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
              className="w-full text-xs"
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
  );
}

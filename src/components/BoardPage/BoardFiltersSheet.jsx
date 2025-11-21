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
  const FilterSection = ({ title, children }) => (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      {children}
    </div>
  );

  const FilterButton = ({ active, onClick, children, icon }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200
        flex items-center gap-1.5
        ${
          active
            ? "bg-primary-900 text-white shadow-sm"
            : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-neutral-900">Filters</SheetTitle>
          <SheetDescription className="text-xs text-neutral-500">
            Refine your view by selecting filters below
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Priority */}
          <FilterSection title="Priority">
            <div className="flex flex-wrap gap-2">
              {["low", "medium", "high"].map((p) => {
                const active = filters.priorities.includes(p);
                return (
                  <FilterButton
                    key={p}
                    active={active}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        priorities: active
                          ? prev.priorities.filter((x) => x !== p)
                          : [...prev.priorities, p],
                      }));
                    }}
                    icon={
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
                    }
                  >
                    <span className="capitalize">{p}</span>
                  </FilterButton>
                );
              })}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection title="Status">
            <div className="flex flex-wrap gap-2">
              {["Backlog", "In Progress", "Review", "Done"].map((status) => {
                const active = filters.statuses.includes(status);
                return (
                  <FilterButton
                    key={status}
                    active={active}
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
                  </FilterButton>
                );
              })}
            </div>
          </FilterSection>

          {/* Labels */}
          <FilterSection title="Labels">
            <div className="flex flex-wrap gap-2">
              {availableLabels.length === 0 && (
                <span className="text-xs text-neutral-400">No labels yet</span>
              )}
              {availableLabels.map((label) => {
                const active = filters.labelIds.includes(label.id);
                return (
                  <FilterButton
                    key={label.id}
                    active={active}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        labelIds: active
                          ? prev.labelIds.filter((id) => id !== label.id)
                          : [...prev.labelIds, label.id],
                      }));
                    }}
                    icon={
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                    }
                  >
                    {label.name}
                  </FilterButton>
                );
              })}
            </div>
          </FilterSection>

          {/* Assigned to */}
          <FilterSection title="Assigned to">
            <div className="flex flex-wrap gap-2">
              {availableAssignees.length === 0 && (
                <span className="text-xs text-neutral-400">
                  No assignments yet
                </span>
              )}
              {availableAssignees.map((member) => {
                const active = filters.assigneeIds.includes(member.id);
                return (
                  <FilterButton
                    key={member.id}
                    active={active}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        assigneeIds: active
                          ? prev.assigneeIds.filter((id) => id !== member.id)
                          : [...prev.assigneeIds, member.id],
                      }));
                    }}
                    icon={
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-medium ${active ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                        {member.avatar || member.name.charAt(0)}
                      </span>
                    }
                  >
                    {member.name}
                  </FilterButton>
                );
              })}
            </div>
          </FilterSection>

          {/* Due date */}
          <FilterSection title="Due date">
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
                  <FilterButton
                    key={option}
                    active={active}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        dueDate: active ? null : option,
                      }));
                    }}
                  >
                    {label}
                  </FilterButton>
                );
              })}
            </div>
          </FilterSection>

          {/* Task type */}
          <FilterSection title="Task type">
            <div className="flex flex-wrap gap-2">
              {["ai", "manual"].map((t) => {
                const active = filters.types.includes(t);
                return (
                  <FilterButton
                    key={t}
                    active={active}
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
                  </FilterButton>
                );
              })}
            </div>
          </FilterSection>

          {/* Clear all button */}
          <div className="pt-4 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
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

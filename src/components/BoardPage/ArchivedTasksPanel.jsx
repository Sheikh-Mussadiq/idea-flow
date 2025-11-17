import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const ArchivedTasksPanel = ({ ideas, onRestoreTask }) => {
  if (ideas.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground">
        <p className="mb-1 font-medium">No archived tasks</p>
        <p className="text-[11px]">
          Archive tasks from the task modal to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1 text-xs">
      {ideas.map((idea) => (
        <div
          key={idea.id}
          className="rounded-xl border border-border/60 bg-card/80 px-3 py-3 shadow-sm flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                {idea.title}
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                {idea.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {idea.type && (
                <Badge
                  variant={idea.type === "ai" ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0.5"
                >
                  {idea.type === "ai" ? "AI" : "Manual"}
                </Badge>
              )}
              {idea.kanbanStatus && (
                <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {idea.kanbanStatus}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {idea.priority && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    idea.priority === "low"
                      ? "bg-emerald-500"
                      : idea.priority === "medium"
                      ? "bg-amber-400"
                      : "bg-red-500"
                  }`}
                />
                <span className="capitalize">{idea.priority}</span>
              </span>
            )}
            {idea.dueDate && (
              <span className="rounded-full bg-muted/80 px-2 py-0.5">
                Due {idea.dueDate}
              </span>
            )}
            {idea.labels.slice(0, 2).map((label) => (
              <span
                key={label.id}
                className="rounded-full px-2 py-0.5 text-[10px] text-background"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
            {idea.labels.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{idea.labels.length - 2} more
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              Archived at{" "}
              {idea.archivedAt
                ? new Date(idea.archivedAt).toLocaleString()
                : "Unknown"}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => onRestoreTask(idea.id)}
            >
              Restore Task
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

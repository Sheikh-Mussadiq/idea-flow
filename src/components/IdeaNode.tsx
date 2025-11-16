import { Handle, Position } from "reactflow";
import { MessageSquare, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IdeaNodeProps {
  data: {
    id: string;
    title: string;
    description: string;
    type: "ai" | "manual";
    assignedTo?: {
      id: string;
      name: string;
      avatar: string;
    };
    onOpenComments: (id: string) => void;
    onDelete?: (id: string) => void;
    onSendToKanban?: (id: string) => void;
    onAddSubIdea?: (id: string) => void;
  };
}

export const IdeaNode = ({ data }: IdeaNodeProps) => {
  return (
    <div
      onClick={() => data.onOpenComments(data.id)}
      className="group relative bg-card rounded-2xl p-6 shadow-medium hover:shadow-float transition-all duration-300 cursor-pointer w-[320px] border border-border/50 animate-fade-in"
    >
      {/* Top Handle for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3"
      />

      {/* Badge */}
      <Badge
        variant={data.type === "ai" ? "default" : "secondary"}
        className="absolute -top-3 left-6 shadow-soft"
      >
        {data.type === "ai" ? "AI" : "Manual"}
      </Badge>

      {/* Content */}
      <div className="space-y-3 mt-2">
        <h3 className="text-lg font-semibold text-foreground leading-snug">
          {data.title}
        </h3>
        {data.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Assigned:</span>
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium">
                {data.assignedTo.avatar}
              </div>
              <span className="max-w-[140px] truncate text-foreground/90">
                {data.assignedTo.name}
              </span>
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {data.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenComments(data.id);
          }}
          className="text-muted-foreground hover:text-primary transition-colors -ml-2"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          <span className="text-xs">Comment</span>
        </Button>

        <div className="flex items-center gap-1">
          {data.onSendToKanban && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                data.onSendToKanban?.(data.id);
              }}
            >
              <Inbox className="h-3.5 w-3.5" />
            </Button>
          )}

          {data.onAddSubIdea && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                data.onAddSubIdea?.(data.id);
              }}
              className="text-muted-foreground hover:text-primary transition-colors text-xs"
            >
              Sub-idea
            </Button>
          )}

          {data.type === "manual" && data.onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(data.id);
              }}
              className="text-muted-foreground hover:text-destructive transition-colors text-xs"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Bottom handle for outgoing connections to sub-ideas */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3"
      />
    </div>
  );
};

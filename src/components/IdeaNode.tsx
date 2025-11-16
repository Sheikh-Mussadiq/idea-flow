import { Handle, Position } from "reactflow";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IdeaNodeProps {
  data: {
    id: string;
    title: string;
    description: string;
    type: "ai" | "manual";
    onOpenComments: (id: string) => void;
    onDelete?: (id: string) => void;
  };
}

export const IdeaNode = ({ data }: IdeaNodeProps) => {
  return (
    <div
      onClick={() => data.onOpenComments(data.id)}
      className="group relative bg-card rounded-2xl p-6 shadow-medium hover:shadow-float transition-all duration-300 cursor-pointer w-[320px] border border-border/50 animate-fade-in"
    >
      {/* Top Handle for connections */}
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />

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
  );
};

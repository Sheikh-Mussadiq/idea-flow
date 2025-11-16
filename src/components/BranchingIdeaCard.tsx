import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BranchingIdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    type: "ai" | "manual";
  };
  onOpenComments: () => void;
  onDelete?: () => void;
  index: number;
  yOffset: number;
}

export const BranchingIdeaCard = ({
  idea,
  onOpenComments,
  onDelete,
  index,
  yOffset,
}: BranchingIdeaCardProps) => {
  return (
    <div
      className="flex flex-col items-center animate-float-up"
      style={{
        animationDelay: `${index * 150}ms`,
        marginTop: `${yOffset}px`,
      }}
    >
      {/* Connector Line */}
      <div className="w-0.5 h-12 bg-gradient-to-b from-border to-transparent mb-4" />

      {/* Card */}
      <div
        onClick={onOpenComments}
        className="group relative bg-card rounded-2xl p-6 shadow-medium hover:shadow-float transition-all duration-300 cursor-pointer w-full max-w-[320px] border border-border/50"
      >
        {/* Badge */}
        <Badge
          variant={idea.type === "ai" ? "default" : "secondary"}
          className="absolute -top-3 left-6 shadow-soft"
        >
          {idea.type === "ai" ? "AI" : "Manual"}
        </Badge>

        {/* Content */}
        <div className="space-y-3 mt-2">
          <h3 className="text-lg font-semibold text-foreground leading-snug">
            {idea.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {idea.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments();
            }}
            className="text-muted-foreground hover:text-primary transition-colors -ml-2"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Comment</span>
          </Button>

          {idea.type === "manual" && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-muted-foreground hover:text-destructive transition-colors text-xs"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

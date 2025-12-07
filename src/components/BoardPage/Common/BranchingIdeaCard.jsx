import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const BranchingIdeaCard = ({
  idea,
  onOpenComments,
  onDelete,
  index,
  yOffset,
}) => {
  return (
    <div
      className="flex flex-col items-center animate-float-up"
      style={{
        animationDelay: `${index * 150}ms`,
        marginTop: `${yOffset}px`,
      }}
    >
      {/* Connector Line */}
      <div className="w-0.5 h-12 bg-gradient-to-b from-neutral-200 dark:from-neutral-700 to-transparent mb-4" />

      {/* Card */}
      <div
        onClick={onOpenComments}
        className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-full max-w-[320px] border border-neutral-200/60 dark:border-neutral-700/60"
      >
        {/* Badge */}
        <Badge
          variant={idea.type === "ai" ? "default" : "secondary"}
          className="absolute -top-3 left-6 shadow-sm"
        >
          {idea.type === "ai" ? "AI" : "Manual"}
        </Badge>

        {/* Content */}
        <div className="space-y-3 mt-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white leading-snug">
            {idea.title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {idea.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-700/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments();
            }}
            className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors -ml-2"
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
              className="text-neutral-600 dark:text-neutral-400 hover:text-error-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

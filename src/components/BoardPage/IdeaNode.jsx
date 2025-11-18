import { Handle, Position } from "reactflow";
import { MessageSquare, Inbox } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const IdeaNode = ({ data }) => {
  return (
    <div
      onClick={() => data.onOpenComments(data.id)}
      className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-[320px] border border-neutral-200/60 animate-fade-in"
    >
      {/* Top Handle for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary-500 !w-3 !h-3"
      />

      {/* Badge */}
      <Badge
        variant={data.type === "ai" ? "default" : "secondary"}
        className="absolute -top-3 left-6 shadow-sm"
      >
        {data.type === "ai" ? "AI" : "Manual"}
      </Badge>

      {/* Content */}
      <div className="space-y-3 mt-2">
        <h3 className="text-lg font-semibold text-neutral-900 leading-snug">
          {data.title}
        </h3>
        {data.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Assigned:</span>
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 rounded-full bg-primary-500/10 text-[10px] flex items-center justify-center text-primary-500 font-medium">
                {data.assignedTo.avatar}
              </div>
              <span className="max-w-[140px] truncate text-neutral-900/90">
                {data.assignedTo.name}
              </span>
            </div>
          </div>
        )}
        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
          {data.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data.onOpenComments(data.id);
          }}
          className="text-neutral-600 hover:text-primary-500 hover:bg-neutral-100 transition-colors -ml-2"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          <span className="text-xs">Comment</span>
        </Button>

        <div className="flex items-center gap-1">
          {data.onSendToKanban && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-600 hover:text-primary-500 hover:bg-neutral-100"
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
              className="text-neutral-600 hover:text-primary-500 hover:bg-neutral-100 transition-colors text-xs"
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
              className="text-neutral-600 hover:text-error-500 hover:bg-neutral-100 transition-colors text-xs"
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
        className="!bg-primary-500 !w-3 !h-3"
      />
    </div>
  );
};

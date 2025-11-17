import { Button } from "@/components/ui/button";

interface FlowToolbarProps {
  viewMode: "flow" | "kanban";
  onChangeView: (mode: "flow" | "kanban") => void;
}

export const FlowToolbar = ({ viewMode, onChangeView }: FlowToolbarProps) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/90 backdrop-blur px-2 py-1 rounded-full shadow-soft border border-border/60">
      <Button
        size="sm"
        variant={viewMode === "flow" ? "default" : "ghost"}
        className="text-xs px-3"
        onClick={() => onChangeView("flow")}
      >
        Flow View
      </Button>
      <Button
        size="sm"
        variant={viewMode === "kanban" ? "default" : "ghost"}
        className="text-xs px-3"
        onClick={() => onChangeView("kanban")}
      >
        Kanban View
      </Button>
    </div>
  );
};

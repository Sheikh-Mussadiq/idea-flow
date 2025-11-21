import { Sparkles, Bold, Italic, Code, Link, Paperclip, Smile } from "lucide-react";
import { Button } from "../../ui/button";

export const CommentToolbar = ({ onAskAI, disabled = false }) => {
  const tools = [
    { icon: Bold, label: "Bold", action: "bold" },
    { icon: Italic, label: "Italic", action: "italic" },
    { icon: Code, label: "Code", action: "code" },
    { icon: Link, label: "Link", action: "link" },
  ];

  const handleToolClick = (action) => {
    // This would integrate with a rich text editor
    console.log("Formatting action:", action);
  };

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-t border-neutral-200">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAskAI}
          disabled={disabled}
          className="h-7 px-2 text-xs text-primary-500 hover:text-primary-600 hover:bg-primary-50 gap-1"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask AI
        </Button>
        <div className="w-px h-4 bg-neutral-200 mx-1" />
        {tools.map((tool) => (
          <Button
            key={tool.action}
            variant="ghost"
            size="icon"
            onClick={() => handleToolClick(tool.action)}
            disabled={disabled}
            title={tool.label}
            className="h-7 w-7 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <tool.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          title="Add attachment"
          className="h-7 w-7 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          title="Add emoji"
          className="h-7 w-7 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
        >
          <Smile className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

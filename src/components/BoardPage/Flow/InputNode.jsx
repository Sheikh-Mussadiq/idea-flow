import { useRef } from "react";
import { Handle, Position } from "reactflow";
import {
  Mic,
  Send,
  Sparkles,
  Plus,
  Lightbulb,
  Newspaper,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";

export const InputNode = ({ data }) => {
  const promptRef = useRef(null);
  const manualRef = useRef(null);

  const handleGenerate = () => {
    if (promptRef.current) {
      const value = promptRef.current.value.trim();
      if (value) {
        data.onGenerate(value);
      }
    }
  };

  const handleAddManual = () => {
    if (manualRef.current) {
      const value = manualRef.current.value.trim();
      if (value) {
        data.onAddManual(value);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (data.mode === "ai") {
        handleGenerate();
      } else {
        handleAddManual();
      }
    }
  };

  const quickActions = [
    {
      icon: Sparkles,
      label: "DeepSearch",
      action: () => data.onModeChange("ai"),
    },
    { icon: Newspaper, label: "Latest News", action: () => {} },
    { icon: ImageIcon, label: "Create an image", action: () => {} },
    { icon: MessageCircle, label: "Get advice", action: () => {} },
  ];

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200/60 dark:border-neutral-700/60 min-w-[700px] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Main Input Container */}
      <div className="relative bg-neutral-50/50 dark:bg-neutral-800/30 rounded-3xl m-6 border border-neutral-200/80 dark:border-neutral-700/80 shadow-sm">
        {/* Textarea */}
        <textarea
          ref={data.mode === "ai" ? promptRef : manualRef}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          placeholder={
            data.mode === "ai" ? "Ask anything..." : "Write your idea..."
          }
          className="w-full h-32 px-6 pt-6 pb-20 text-base text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent resize-none focus:outline-none nopan nowheel nodrag"
          rows={4}
        />

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between">
          {/* Left Side - Mode Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                data.onModeChange(data.mode === "ai" ? "manual" : "ai")
              }
              className="p-2.5 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors text-neutral-600 dark:text-neutral-400"
              title="Add manual idea"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={() => data.onModeChange("ai")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                data.mode === "ai"
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Tools
            </button>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-all flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </button>
            <button
              onClick={data.mode === "ai" ? handleGenerate : handleAddManual}
              disabled={data.isGenerating}
              className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              title={data.mode === "ai" ? "Generate ideas" : "Add idea"}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="px-6 pb-6 flex items-center gap-3 flex-wrap">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium transition-all flex items-center gap-2 border border-neutral-200/60 dark:border-neutral-700/60"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Bottom Handle for connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary-500 !w-3 !h-3"
      />
    </div>
  );
};

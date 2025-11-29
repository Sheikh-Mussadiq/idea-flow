import { useRef } from "react";
import { Handle, Position } from "reactflow";
import { Button } from "../../ui/button";
import { Sparkles, Plus, RotateCw, Trash2 } from "lucide-react";

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

  const handleClearManual = () => {
    if (manualRef.current) {
      manualRef.current.value = "";
    }
    data.onClearManual();
  };

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl py-4 px-8 border border-neutral-200/60 dark:border-neutral-700/60 min-w-[600px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => data.onModeChange("ai")}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            data.mode === "ai"
              ? "bg-primary-500 text-white shadow-md"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          <Sparkles className="inline h-4 w-4 mr-1.5" />
          AI Mode
        </button>
        <button
          onClick={() => data.onModeChange("manual")}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            data.mode === "manual"
              ? "bg-primary-500 text-white shadow-md"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          <Plus className="inline h-4 w-4 mr-1.5" />
          Manual Mode
        </button>
      </div>

      {/* Input Section */}
      {data.mode === "ai" ? (
        <div className="space-y-4">
          <textarea
            ref={promptRef}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Describe what kind of content ideas you want…"
            className="w-full h-24 px-4 py-3 text-base rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent nopan nowheel nodrag"
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={data.isGenerating}
              className="flex-1 h-12 rounded-xl"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {data.isGenerating ? "Generating..." : "Generate Ideas"}
            </Button>
            {data.hasIdeas && (
              <Button
                onClick={data.onRegenerate}
                disabled={data.isGenerating}
                variant="outline"
                className="h-12 rounded-xl"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            ref={manualRef}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Write your idea…"
            className="w-full h-24 px-4 py-3 text-base rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent nopan nowheel nodrag"
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              onClick={handleAddManual}
              className="flex-1 h-12 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Idea
            </Button>
            <Button
              onClick={handleClearManual}
              variant="outline"
              className="h-12 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Handle for connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary-500 !w-3 !h-3"
      />
    </div>
  );
};

import { Handle, Position } from "reactflow";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Sparkles, Plus, RotateCw, Trash2 } from "lucide-react";

export const InputNode = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl py-4 px-8 border border-neutral-200/60 min-w-[600px]">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => data.onModeChange("ai")}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            data.mode === "ai"
              ? "bg-primary-500 text-white shadow-md"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <Plus className="inline h-4 w-4 mr-1.5" />
          Manual Mode
        </button>
      </div>

      {/* Input Section */}
      {data.mode === "ai" ? (
        <div className="space-y-4">
          <Input
            value={data.prompt}
            onChange={(e) => data.onPromptChange(e.target.value)}
            placeholder="Describe what kind of content ideas you want…"
            className="h-14 text-base rounded-xl border-neutral-200 bg-neutral-50"
          />
          <div className="flex gap-3">
            <Button
              onClick={data.onGenerate}
              disabled={data.isGenerating || !data.prompt.trim()}
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
          <Input
            value={data.manualIdea}
            onChange={(e) => data.onManualIdeaChange(e.target.value)}
            placeholder="Write your idea…"
            className="h-14 text-base rounded-xl border-neutral-200 bg-neutral-50"
          />
          <div className="flex gap-3">
            <Button
              onClick={data.onAddManual}
              disabled={!data.manualIdea.trim()}
              className="flex-1 h-12 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Idea
            </Button>
            <Button
              onClick={data.onClearManual}
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

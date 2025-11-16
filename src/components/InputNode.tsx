import { Handle, Position } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, RotateCw, Trash2 } from "lucide-react";

interface InputNodeProps {
  data: {
    mode: "ai" | "manual";
    onModeChange: (mode: "ai" | "manual") => void;
    prompt: string;
    onPromptChange: (value: string) => void;
    manualIdea: string;
    onManualIdeaChange: (value: string) => void;
    onGenerate: () => void;
    onAddManual: () => void;
    onRegenerate: () => void;
    onClearManual: () => void;
    isGenerating: boolean;
    hasIdeas: boolean;
  };
}

export const InputNode = ({ data }: InputNodeProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-large py-4 px-8 border border-border/50 min-w-[600px]">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => data.onModeChange("ai")}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            data.mode === "ai"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Sparkles className="inline h-4 w-4 mr-1.5" />
          AI Mode
        </button>
        <button
          onClick={() => data.onModeChange("manual")}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            data.mode === "manual"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
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
            className="h-14 text-base rounded-xl border-border/50 bg-background"
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
            className="h-14 text-base rounded-xl border-border/50 bg-background"
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
        className="!bg-primary !w-3 !h-3"
      />
    </div>
  );
};

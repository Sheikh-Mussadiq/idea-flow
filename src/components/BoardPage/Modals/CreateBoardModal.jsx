import { useState } from "react";
import {
  X,
  Globe,
  Type,
  AlignLeft,
  Palette,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "../../ui/button";
import { useBoard } from "../../../context/BoardContext";
import { useNavigate } from "react-router-dom";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#71717a",
  "#171717",
];

const PRESET_ICONS = [
  "🎯",
  "🚀",
  "💡",
  "⚡",
  "📅",
  "✅",
  "🔥",
  "🎨",
  "📁",
  "🌟",
];

export const CreateBoardModal = ({ isOpen, onClose }) => {
  const { createBoard } = useBoard();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🎯",
    color: "#6366f1",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const newBoard = await createBoard(formData);

      // Navigate to the new board
      navigate(`/boards/${newBoard.id}/kanban`);
      onClose();
    } catch (error) {
      console.error("Error creating board:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-neutral-200/60 dark:border-neutral-800 animate-scale-in pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Create New Board
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Board Name */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Type className="h-3 w-3" />
                Board Name
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="Marketing Campaign, Product Roadmap..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full h-11 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
              />
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Select Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      formData.icon === icon
                        ? "bg-white dark:bg-neutral-800 shadow-lg ring-2 ring-primary-500 scale-110"
                        : "bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <AlignLeft className="h-3 w-3" />
                Description{" "}
                <span className="lowercase font-normal opacity-60">
                  (optional)
                </span>
              </label>
              <textarea
                placeholder="What's this board about?"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-neutral-900 dark:text-white"
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Palette className="h-3 w-3" />
                Theme Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full transition-all ${
                      formData.color === color
                        ? "ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-neutral-950 scale-125"
                        : "hover:scale-110"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl text-neutral-600 dark:text-neutral-400 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-[2] h-11 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 font-bold transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Board"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

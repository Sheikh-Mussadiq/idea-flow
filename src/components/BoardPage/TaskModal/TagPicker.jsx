import { useState } from "react";
import { Plus, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

export const TagPicker = ({
  availableTags = [],
  selectedTagIds = [],
  onAddTag,
  onRemoveTag,
  onCreateTag,
  canEdit = true,
  boardId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await onCreateTag?.(boardId, newTagName, newTagColor);
      setNewTagName("");
      setNewTagColor("#6366f1");
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const handleTagClick = (tagId, isSelected) => {
    if (isSelected) {
      onRemoveTag?.(tagId);
    } else {
      onAddTag?.(tagId);
    }
    // Keep dropdown open for multiple selections
  };

  const colorOptions = [
    "#6366f1", // indigo
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#a855f7", // purple
    "#ec4899", // pink
  ];

  if (!canEdit) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 cursor-pointer">
          <Plus className="h-3 w-3" />
          Add Tag
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Existing Tags */}
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            Available Tags
          </p>
          {availableTags.length === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 py-2">
              No tags yet
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <Button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id, isSelected)}
                    variant="ghost"
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm justify-start font-normal h-auto hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                      isSelected
                        ? "bg-neutral-50 dark:bg-neutral-800/50"
                        : "bg-transparent"
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 truncate ml-1 text-left text-neutral-700 dark:text-neutral-200">
                      {tag.name}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Create New Tag */}
        <div className="px-2 py-2 space-y-2">
          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            Create New Tag
          </p>
          <Input
            type="text"
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateTag();
              }
            }}
            className="h-8 text-xs bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          />
          <div className="flex items-center gap-1 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  newTagColor === color
                    ? "border-neutral-900 dark:border-white scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <button
            onClick={handleCreateTag}
            disabled={!newTagName.trim()}
            className="w-full px-2 py-1.5 text-xs font-medium bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Tag
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

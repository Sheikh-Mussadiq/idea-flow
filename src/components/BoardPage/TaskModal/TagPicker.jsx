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

export const TagPicker = ({
  availableTags = [],
  selectedTagIds = [],
  onAddTag,
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

  const handleAddTag = (tagId) => {
    onAddTag?.(tagId);
    setIsOpen(false);
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
          <p className="text-xs font-semibold text-neutral-600 mb-2">
            Available Tags
          </p>
          {availableTags.length === 0 ? (
            <p className="text-xs text-neutral-400 py-2">No tags yet</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    disabled={isSelected}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 truncate">{tag.name}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Create New Tag */}
        <div className="px-2 py-2 space-y-2">
          <p className="text-xs font-semibold text-neutral-600">
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
            className="h-8 text-xs"
          />
          <div className="flex items-center gap-1">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  newTagColor === color
                    ? "border-neutral-900 dark:border-white"
                    : "border-transparent"
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

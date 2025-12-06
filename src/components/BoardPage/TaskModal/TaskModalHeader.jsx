import { useState, useEffect } from "react";
import { X, Maximize2, Edit3, ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "../../ui/button";

export const TaskModalHeader = ({
  title,
  breadcrumb,
  onClose,
  onEdit,
  onExpand,
  onUpdateTitle,
  canEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleSave = () => {
    if (localTitle.trim() && localTitle !== title) {
      onUpdateTitle?.(localTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setLocalTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex-shrink-0 rounded-t-2xl border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-6 py-4">
      {/* Breadcrumb and actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <button className="hover:text-primary-500 dark:hover:text-white transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <span>{breadcrumb || "Project UI/UX / In section review"}</span>
        </div>
        <div className="flex items-center gap-1">
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onExpand}
            className="h-7 w-7 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title */}
      {isEditing ? (
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full text-2xl font-semibold text-neutral-900 dark:text-white bg-transparent border-b-2 border-primary-500 focus:outline-none"
        />
      ) : (
        <h2
          className="text-2xl font-semibold text-neutral-900 dark:text-white cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200"
          onClick={() => canEdit && setIsEditing(true)}
        >
          {title}
        </h2>
      )}
    </div>
  );
};

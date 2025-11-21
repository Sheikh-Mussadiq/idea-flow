import { X, Maximize2, Edit3, ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "../../ui/button";

export const TaskModalHeader = ({ title, breadcrumb, onClose, onEdit, onExpand }) => {
  return (
    <div className="flex-shrink-0 rounded-t-2xl border-b border-neutral-200 bg-white px-6 py-4">
      {/* Breadcrumb and actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <button className="hover:text-primary-500 transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <span>{breadcrumb || "Project UI/UX / In section review"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-7 w-7 text-neutral-400 hover:text-neutral-600"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExpand}
            className="h-7 w-7 text-neutral-400 hover:text-neutral-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 hover:text-neutral-600"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-neutral-200 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
    </div>
  );
};

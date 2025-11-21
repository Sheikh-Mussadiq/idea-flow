import { FileText, Image, Film, Link as LinkIcon, X } from "lucide-react";
import { Button } from "../../ui/button";

export const AttachmentCard = ({ attachment, onRemove, onView, canEdit = true }) => {
  const getIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Film className="h-5 w-5 text-purple-500" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="group relative flex items-start gap-3 p-3 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 hover:shadow-sm transition-all">
      <div className="flex-shrink-0 p-2 bg-neutral-50 rounded-md">
        {getIcon(attachment.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => onView?.(attachment)}
            className="text-sm font-medium text-neutral-900 hover:text-primary-500 truncate text-left transition-colors"
          >
            {attachment.name}
          </button>
          {canEdit && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(attachment.id)}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 text-neutral-400 hover:text-error-500 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {attachment.size && (
          <p className="text-xs text-neutral-500 mt-0.5">
            {formatFileSize(attachment.size)}
          </p>
        )}
      </div>
    </div>
  );
};

import {
  FileText,
  Image,
  Film,
  Link as LinkIcon,
  MoreVertical,
  Download,
  Trash,
  File,
  FileArchive,
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export const AttachmentCard = ({
  attachment,
  onRemove,
  onView,
  canEdit = true,
}) => {
  const getFileStyle = (filename, type) => {
    const ext = filename?.split(".").pop()?.toLowerCase();

    // PDF
    if (ext === "pdf") {
      return {
        icon: <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />,
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "group-hover:border-red-200 dark:group-hover:border-red-800",
      };
    }

    // Word / Docs
    if (["doc", "docx", "txt", "rtf"].includes(ext)) {
      return {
        icon: <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
      };
    }

    // Excel / Sheets
    if (["xls", "xlsx", "csv"].includes(ext)) {
      return {
        icon: (
          <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        ), // Using FileText for standard look, relying on color
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border:
          "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
      };
    }

    // Images
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) ||
      type === "image"
    ) {
      return {
        icon: (
          <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        ),
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border:
          "group-hover:border-purple-200 dark:group-hover:border-purple-800",
      };
    }

    // Video
    if (["mp4", "mov", "avi", "webm"].includes(ext) || type === "video") {
      return {
        icon: <Film className="h-5 w-5 text-pink-600 dark:text-pink-400" />,
        bg: "bg-pink-50 dark:bg-pink-900/20",
        border: "group-hover:border-pink-200 dark:group-hover:border-pink-800",
      };
    }

    // Archives
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return {
        icon: (
          <FileArchive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        ),
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border:
          "group-hover:border-orange-200 dark:group-hover:border-orange-800",
      };
    }

    // Links
    if (type === "link") {
      return {
        icon: <LinkIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
        bg: "bg-sky-50 dark:bg-sky-900/20",
        border: "group-hover:border-sky-200 dark:group-hover:border-sky-800",
      };
    }

    // Default
    return {
      icon: <File className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />,
      bg: "bg-neutral-100 dark:bg-neutral-800",
      border:
        "group-hover:border-neutral-300 dark:group-hover:border-neutral-600",
    };
  };

  const style = getFileStyle(attachment.name, attachment.type);

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (!attachment.url) return;
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`group relative flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-sm transition-all text-left min-w-[280px] w-[280px] snap-start flex-shrink-0 ${style.border}`}
    >
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${style.bg} transition-colors`}
      >
        {style.icon}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <button
          onClick={() => onView?.(attachment)}
          className="text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 truncate text-left transition-colors"
        >
          {attachment.name}
        </button>
        {attachment.size && (
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {formatFileSize(attachment.size)}
          </p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0 text-neutral-400 data-[state=open]:opacity-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-200 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleDownload}
            className="gap-2 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50"
          >
            <Download className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
            <span className="dark:text-neutral-200">Download</span>
          </DropdownMenuItem>
          {canEdit && onRemove && (
            <DropdownMenuItem
              onClick={() => onRemove(attachment.id)}
              className="gap-2 text-red-600 dark:text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-400"
            >
              <Trash className="h-3.5 w-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

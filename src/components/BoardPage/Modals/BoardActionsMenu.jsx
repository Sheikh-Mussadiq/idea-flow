import {
  Activity,
  Copy,
  Archive,
  Trash2,
  Download,
  Settings,
  Share2,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export const BoardActionsMenu = ({
  trigger,
  onViewActivity,
  onDuplicate,
  onArchive,
  onDelete,
  onExport,
  onSettings,
  onShare,
  onSaveAsTemplate,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 dark:bg-neutral-900 dark:border-neutral-700"
      >
        <DropdownMenuLabel className="dark:text-neutral-400">
          Board Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-neutral-700" />

        {/* View Actions */}
        <DropdownMenuItem
          onClick={onViewActivity}
          className="gap-2 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Activity className="h-4 w-4" />
          <span>View Activity</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="dark:bg-neutral-700" />

        {/* Board Management */}
        <DropdownMenuItem
          onClick={onDuplicate}
          className="gap-2 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Copy className="h-4 w-4" />
          <span>Duplicate Board</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onSaveAsTemplate}
          className="gap-2 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <FileText className="h-4 w-4" />
          <span>Save as Template</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onExport}
          className="gap-2 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Download className="h-4 w-4" />
          <span>Export Board</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="dark:bg-neutral-700" />

        {/* Settings & Sharing */}
        <DropdownMenuItem
          onClick={onShare}
          className="gap-2 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Board</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onSettings}
          className="gap-2 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Settings className="h-4 w-4" />
          <span>Board Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="dark:bg-neutral-700" />

        {/* Destructive Actions */}
        <DropdownMenuItem
          onClick={onArchive}
          className="gap-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
        >
          <Archive className="h-4 w-4" />
          <span>Archive Board</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Board</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

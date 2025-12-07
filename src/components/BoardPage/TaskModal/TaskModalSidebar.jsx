import {
  Calendar,
  Tag,
  Download,
  Check,
  Info,
  Users,
  FileText,
  Paperclip,
  Plus,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { AvatarGroup } from "./AvatarGroup";
import { AttachmentCard } from "./AttachmentCard";
import { TagPicker } from "./TagPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

export const TaskModalSidebar = ({
  status,
  dueDate,
  assignees,
  tags,
  description,
  attachments,
  onStatusChange,
  onDueDateChange,
  onAddMember,
  onRemoveMember,
  onDescriptionChange,
  onRemoveAttachment,
  onViewAttachment,
  onAddAttachment,
  onAddLabel,
  onRemoveLabel,
  onCreateTag,
  availableTags = [],
  boardId,
  canEdit = true,
  columns = [],
  teamMembers = [],
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddAttachment?.(file);
      e.target.value = ""; // Reset
    }
  };

  return (
    <div className="w-full p-6">
      <div className="space-y-8">
        {/* Metadata Grid */}
        <div className="grid grid-cols-[220px_1fr] gap-y-6 items-start">
          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 pt-1.5">
            <Info className="h-4 w-4" />
            <span>Status</span>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!canEdit}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors">
                  <div className="h-2 w-2 rounded-full border-[1.5px] border-sky-500" />
                  <span className="text-sm font-medium text-sky-600 dark:text-sky-400">
                    {status}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {columns.map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => onStatusChange?.(col)}
                    className="gap-2"
                  >
                    {status === col.title && <Check className="h-4 w-4" />}
                    <span className={status === col.title ? "ml-0" : "ml-6"}>
                      {col.title}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 pt-1.5">
            <Calendar className="h-4 w-4" />
            <span>Due date</span>
          </div>
          <div className="flex items-center pt-1.5">
            {dueDate ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => onDueDateChange?.(e.target.value)}
                disabled={!canEdit}
                className="bg-transparent border-none focus:outline-none p-0 text-sm font-medium text-neutral-900 dark:text-neutral-100"
              />
            ) : (
              <button
                onClick={() =>
                  onDueDateChange?.(new Date().toISOString().split("T")[0])
                }
                disabled={!canEdit}
                className="text-sm text-neutral-400 hover:text-primary-500 transition-colors"
              >
                Set due date
              </button>
            )}
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 pt-1.5">
            <Users className="h-4 w-4" />
            <span>Assignee</span>
          </div>
          <div className="flex items-center gap-3">
            <AvatarGroup
              members={assignees || []}
              maxDisplay={4}
              onAddMember={undefined}
              onRemoveMember={onRemoveMember}
              canEdit={canEdit}
            />
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    Add members <Plus className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {teamMembers.map((member) => {
                    const memberId =
                      member.user?.id || member.user_id || member.id;
                    const isAssigned = assignees?.some((a) => {
                      const assigneeId = a.id || a.user?.id || a.user_id;
                      return assigneeId === memberId;
                    });
                    return (
                      <DropdownMenuItem
                        key={memberId}
                        onClick={() => onAddMember?.(member)}
                        className="gap-2"
                      >
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.user?.avatar_url} />
                            <AvatarFallback>
                              {member.user?.full_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {isAssigned && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-white">
                              <Check className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="flex-1 truncate">
                          {member.user?.full_name || member.user?.email}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 pt-1.5">
            <Tag className="h-4 w-4" />
            <span>Tags</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md"
                style={{
                  backgroundColor: tag.color ? `${tag.color}15` : "#6366f115",
                  color: tag.color || "#6366f1",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tag.color || "#6366f1" }}
                />
                {tag.name}
              </span>
            ))}
            <TagPicker
              availableTags={availableTags}
              selectedTagIds={(tags || []).map((t) =>
                typeof t === "object" ? t.id : t
              )}
              onAddTag={onAddLabel}
              onCreateTag={onCreateTag}
              boardId={boardId}
              canEdit={canEdit}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <FileText className="h-4 w-4" />
            <span>Description</span>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-1 border border-neutral-100 dark:border-neutral-800">
            <textarea
              value={description || ""}
              onChange={(e) => onDescriptionChange?.(e.target.value)}
              disabled={!canEdit}
              placeholder="Add more details, notes, or context..."
              className="w-full px-4 py-3 text-sm bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400"
              rows={4}
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Paperclip className="h-4 w-4" />
              <span>Attachment ({attachments?.length || 0})</span>
            </div>
            {attachments && attachments.length > 0 && (
              <button className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                <Download className="h-3 w-3" />
                Download All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments?.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                onRemove={onRemoveAttachment}
                onView={onViewAttachment}
                canEdit={canEdit}
              />
            ))}
            {canEdit && (
              <div className="relative group">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-16 h-16 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer transition-all"
                >
                  <Plus className="h-6 w-6 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

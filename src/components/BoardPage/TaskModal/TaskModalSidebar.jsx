import { Calendar, Tag, Download, Check } from "lucide-react";
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
      <div className="space-y-6">
        <div className="grid grid-cols-[120px_1fr] gap-y-6 items-center">
          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <div className="w-4 flex justify-center">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-neutral-400" />
            </div>
            <span>Status</span>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!canEdit}>
                <div className="inline-block">
                  <StatusBadge status={status} />
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
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="h-4 w-4" />
            <span>Due date</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-900 font-medium">
            {dueDate ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => onDueDateChange?.(e.target.value)}
                disabled={!canEdit}
                className="bg-transparent border-none focus:outline-none p-0 font-medium"
              />
            ) : (
              <button
                onClick={() =>
                  onDueDateChange?.(new Date().toISOString().split("T")[0])
                }
                disabled={!canEdit}
                className="text-neutral-400 hover:text-primary-500 transition-colors"
              >
                Set due date
              </button>
            )}
          </div>

          {/* Assignees */}
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <div className="w-4 flex justify-center">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <span>Assignee</span>
          </div>
          <div className="flex items-center gap-2">
            <AvatarGroup
              members={assignees || []}
              maxDisplay={4}
              onAddMember={undefined} // Handled by separate button or dropdown
              onRemoveMember={onRemoveMember}
              canEdit={canEdit}
            />
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors">
                    Add +
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {teamMembers.map((member) => {
                    const memberId = member.user?.id || member.user_id || member.id;
                    // Assignees are user objects, so check a.id directly
                    const isAssigned = assignees?.some(
                      (a) => {
                        const assigneeId = a.id || a.user?.id || a.user_id;
                        return assigneeId === memberId;
                      }
                    );
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
            </div>
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
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md"
                style={{
                  backgroundColor: tag.color ? `${tag.color}15` : "#6366f115",
                  color: tag.color || "#6366f1",
                }}
              >
                <Tag className="h-3 w-3" />
                {tag.name}
              </span>
            ))}
            {(!tags || tags.length === 0) && (
              <span className="text-sm text-neutral-400">No tags</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <div className="w-4 flex justify-center">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <span>Description</span>
          </div>
          <textarea
            value={description || ""}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            disabled={!canEdit}
            placeholder="Add more details, notes, or context..."
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Attachments */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <div className="w-4 flex justify-center">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </div>
              <span>Attachment ({attachments?.length || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 cursor-pointer"
                  >
                    Add +
                  </label>
                </div>
              )}
              {attachments && attachments.length > 0 && (
                <button className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  Download All
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {attachments?.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                onRemove={onRemoveAttachment}
                onView={onViewAttachment}
                canEdit={canEdit}
              />
            ))}
            {(!attachments || attachments.length === 0) && (
              <p className="text-sm text-neutral-500 py-4 text-center border border-dashed border-neutral-200 rounded-lg">
                No attachments
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

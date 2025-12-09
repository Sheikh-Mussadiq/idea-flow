import { useState } from "react";
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
  Flag,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRef } from "react";
import { StatusBadge } from "./StatusBadge";
import { AvatarGroup } from "./AvatarGroup";
import { AttachmentCard } from "./AttachmentCard";
import { TagPicker } from "./TagPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { RichTextEditor } from "../../ui/RichTextEditor";

export const TaskModalSidebar = ({
  status,
  dueDate,
  priority,
  assignees,
  tags,
  description,
  attachments,
  onStatusChange,
  onDueDateChange,
  onPriorityChange,
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
  const [removingTagId, setRemovingTagId] = useState(null);
  const attachmentScrollRef = useRef(null);

  const scrollAttachments = (direction) => {
    if (attachmentScrollRef.current) {
      const scrollAmount = 300; // Approx card width + gap
      attachmentScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddAttachment?.(file);
      e.target.value = ""; // Reset
    }
  };

  const handleRemoveTag = async (tagId) => {
    setRemovingTagId(tagId);
    try {
      await onRemoveLabel?.(tagId);
    } catch (err) {
      console.error("Error removing tag", err);
    } finally {
      setRemovingTagId(null);
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
                    className="gap-2 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50"
                  >
                    {status === col.title && (
                      <Check className="h-4 w-4 dark:text-neutral-200" />
                    )}
                    <span
                      className={`${
                        status === col.title ? "ml-0" : "ml-6"
                      } dark:text-neutral-200`}
                    >
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

          {/* Priority */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 pt-1.5">
            <Flag className="h-4 w-4" />
            <span>Priority</span>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!canEdit}>
                <div
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                    !priority
                      ? "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500"
                      : priority.toLowerCase() === "high"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400"
                      : priority.toLowerCase() === "medium"
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  <Flag
                    className={`h-3.5 w-3.5 ${priority ? "fill-current" : ""}`}
                  />
                  <span className="text-xs font-medium">
                    {priority
                      ? priority.charAt(0).toUpperCase() + priority.slice(1)
                      : "Set priority"}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {[
                  {
                    label: "High",
                    value: "high",
                    color: "text-red-600 dark:text-red-500",
                  },
                  {
                    label: "Medium",
                    value: "medium",
                    color: "text-orange-600 dark:text-orange-500",
                  },
                  {
                    label: "Low",
                    value: "low",
                    color: "text-blue-600 dark:text-blue-500",
                  },
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onPriorityChange?.(option.value)}
                    className="gap-2 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50"
                  >
                    <Flag className={`h-4 w-4 fill-current ${option.color}`} />
                    <span className="dark:text-neutral-200">
                      {option.label}
                    </span>
                    {priority === option.value && (
                      <Check className="h-4 w-4 ml-auto dark:text-neutral-200" />
                    )}
                  </DropdownMenuItem>
                ))}
                {priority && (
                  <>
                    <DropdownMenuSeparator className="dark:bg-neutral-700" />
                    <DropdownMenuItem
                      onClick={() => onPriorityChange?.(null)}
                      className="text-neutral-500 dark:text-neutral-400 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-700 dark:focus:text-neutral-200"
                    >
                      Clear priority
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
                        className="gap-2 cursor-pointer focus:bg-neutral-100 dark:focus:!bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50"
                      >
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.user?.avatar_url} />
                            <AvatarFallback>
                              {member.user?.full_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {isAssigned && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-white dark:border-neutral-900">
                              <Check className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="flex-1 truncate dark:text-neutral-200">
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
            {tags?.map((tag, index) => {
              // Handle both tag objects and tag IDs
              let tagObj = typeof tag === "object" ? tag : null;

              // If tag is an ID, find it in availableTags
              if (!tagObj && availableTags) {
                tagObj = availableTags.find((t) => t.id === tag);
              }

              if (!tagObj) return null;

              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md group/tag relative overflow-hidden"
                  style={{
                    backgroundColor: tagObj.color
                      ? `${tagObj.color}15`
                      : "#6366f115",
                    color: tagObj.color || "#6366f1",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tagObj.color || "#6366f1" }}
                  />
                  <span className="group-hover/tag:[mask-image:linear-gradient(to_right,black_45%,transparent)] transition-all duration-200">
                    {tagObj.name}
                  </span>
                  {canEdit && (
                    <>
                      {removingTagId === tagObj.id ? (
                        <div className="absolute right-0 top-0 bottom-0 w-6 flex items-center justify-center">
                          <Loader2 className="h-3 w-3 animate-spin text-neutral-500 dark:text-neutral-400" />
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(tagObj.id);
                          }}
                          className="absolute right-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover/tag:opacity-100 transition-opacity duration-200 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  )}
                </span>
              );
            })}
            <TagPicker
              availableTags={availableTags}
              selectedTagIds={(tags || []).map((t) =>
                typeof t === "object" ? t.id : t
              )}
              onAddTag={onAddLabel}
              onRemoveTag={onRemoveLabel}
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
          <div
            className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden flex flex-col"
            style={{
              resize: "vertical",
              overflow: "hidden",
              height: "180px",
              minHeight: "100px",
              maxHeight: "400px",
            }}
          >
            <RichTextEditor
              value={description || ""}
              onChange={onDescriptionChange}
              disabled={!canEdit}
              placeholder="Add more details, notes, or context..."
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

          <div className="relative group/attachments">
            {(attachments?.length > 0 || canEdit) && (
              <>
                <button
                  onClick={() => scrollAttachments("left")}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 opacity-0 group-hover/attachments:opacity-100 transition-opacity disabled:opacity-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollAttachments("right")}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 opacity-0 group-hover/attachments:opacity-100 transition-opacity disabled:opacity-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <div
              ref={attachmentScrollRef}
              className="flex items-center gap-3 overflow-x-auto w-full custom-scrollbar snap-x no-scrollbar scroll-smooth px-5 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]"
            >
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
                <div className="relative group flex-shrink-0 snap-start">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-16 h-[66px] rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer transition-all"
                  >
                    <Plus className="h-6 w-6 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

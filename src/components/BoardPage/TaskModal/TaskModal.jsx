import { useEffect, useLayoutEffect, useState } from "react";
import { TaskModalHeader } from "./TaskModalHeader";
import { TaskModalSidebar } from "./TaskModalSidebar";
import { TaskModalTabs } from "./TaskModalTabs";
import { SubtasksTab } from "./SubtasksTab";
import { CommentsTab } from "./CommentsTab";
import { ActivitiesTab } from "./ActivitiesTab";
import { TeamTab } from "./TeamTab";
import { useNotifications } from "../../../context/NotificationsContext";
import { attachmentService } from "../../../services/attachmentService";

export const TaskModal = ({
  isOpen,
  onClose,
  idea,
  columns,
  teamMembers,
  availableTags = [],
  boardId,
  onAssign,
  onStatusChange,
  onChangeDueDate,
  onChangePriority,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onUpdateTitle,
  onUpdateDescription,
  onAddAttachment,
  onRemoveAttachment,
  onAddLabel,
  onRemoveLabel,
  onCreateTag,
  comments,
  onAddCommentToIdea,
  onDeleteComment,
  onUpdateComment,
  onArchiveTask,
  onUpdateCard,
  canEdit,
}) => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("subtasks");
  const [isClosing, setIsClosing] = useState(false);
  const [localDescription, setLocalDescription] = useState("");
  const [tagsState, setTagsState] = useState([]);
  const [attachmentsWithUrls, setAttachmentsWithUrls] = useState([]);

  // Generate signed URLs for attachments when modal opens (lazy loading)
  useEffect(() => {
    if (!isOpen || !idea) {
      setAttachmentsWithUrls([]);
      return;
    }

    const attachments = idea.attachments || [];
    if (attachments.length === 0) {
      setAttachmentsWithUrls([]);
      return;
    }

    const generateUrls = async () => {
      // Check which attachments need URLs (don't regenerate if already have one)
      const attachmentsNeedingUrls = attachments.filter(
        (att) => !att.url && att.file_url
      );

      if (attachmentsNeedingUrls.length === 0) {
        // All attachments already have URLs, use them as-is
        setAttachmentsWithUrls(attachments);
        return;
      }

      // Generate URLs for attachments that need them
      try {
        const urls = await Promise.all(
          attachmentsNeedingUrls.map(async (att) => {
            try {
              const signedUrl = await attachmentService.getAttachmentUrl(
                att.file_url,
                3600 // 1 hour expiration
              );
              return { ...att, url: signedUrl };
            } catch (error) {
              console.error(`Error generating URL for attachment ${att.id}:`, error);
              return { ...att, url: null };
            }
          })
        );

        // Merge with attachments that already had URLs
        const attachmentsWithExistingUrls = attachments.filter(
          (att) => att.url
        );
        const allAttachments = [...attachmentsWithExistingUrls, ...urls];

        // Update the card in the board context with the new URLs (cache them)
        if (onUpdateCard) {
          onUpdateCard(idea.id, { attachments: allAttachments });
        }

        setAttachmentsWithUrls(allAttachments);
      } catch (error) {
        console.error("Error generating attachment URLs:", error);
        setAttachmentsWithUrls(attachments);
      }
    };

    generateUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, idea?.id]);

  useLayoutEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !idea) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleDescriptionSave = (value) => {
    setLocalDescription(value);
    onUpdateDescription?.(idea.id, value);
  };

  const handleStatusChange = (column) => {
    onStatusChange?.(column.id);
    // Mock notification
    addNotification({
      userId: "current-user",
      message: `Status updated to '${column.title}' for '${idea.title}'`,
      type: "activity",
      taskId: idea.id,
      boardId: idea.boardId,
    });
  };

  const handleAddMember = (member) => {
    onAssign?.(idea.id, member);
    // Mock notification
    addNotification({
      userId: "current-user",
      message: `Assigned ${member.user?.full_name} to '${idea.title}'`,
      type: "assignment",
      taskId: idea.id,
      boardId: idea.boardId,
    });
  };

  const handleTitleSave = (newTitle) => {
    onUpdateTitle?.(idea.id, newTitle);
  };

  const handleDueDateChange = (date) => {
    onChangeDueDate?.(idea.id, date);
    addNotification({
      userId: "current-user",
      message: `Due date changed to ${date} for '${idea.title}'`,
      type: "due",
      taskId: idea.id,
      boardId: idea.boardId,
    });
  };

  const handleAddComment = (text) => {
    onAddCommentToIdea?.(idea.id, text);

    // Check for mentions
    if (text.includes("@")) {
      addNotification({
        userId: "current-user",
        message: `You were mentioned in a comment on '${idea.title}'`,
        type: "mention",
        taskId: idea.id,
        boardId: idea.boardId,
      });
    } else {
      // Notify participants
      addNotification({
        userId: "current-user",
        message: `New comment on '${idea.title}'`,
        type: "general",
        taskId: idea.id,
        boardId: idea.boardId,
      });
    }
  };

  // Map idea data to sidebar props
  const assignees =
    idea.assignees || (idea.assignedTo ? [idea.assignedTo] : []);

  // Use attachmentsWithUrls if available (has signed URLs), otherwise fallback to idea.attachments
  const attachments = (attachmentsWithUrls.length > 0 ? attachmentsWithUrls : idea.attachments || []).map((att) => ({
    ...att,
    size: att.file_size || att.size || 0,
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div
        className={`fixed top-4 right-4 bottom-4 z-50 w-full max-w-3xl h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-700 transition-transform duration-300 ease-out ${
          isClosing ? "animate-slide-out-right" : "animate-slide-in-right"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <TaskModalHeader
          title={idea.title}
          breadcrumb="Project UI/UX / In section review"
          onClose={handleClose}
          onEdit={() => console.log("Edit")}
          onExpand={() => console.log("Expand")}
          onUpdateTitle={handleTitleSave}
          canEdit={canEdit}
        />

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Sidebar (now top content) */}
          <TaskModalSidebar
            status={idea.kanbanStatus || "Backlog"}
            dueDate={idea.dueDate}
            assignees={assignees}
            tags={tagsState}
            description={localDescription}
            attachments={attachments}
            onStatusChange={handleStatusChange}
            onDueDateChange={handleDueDateChange}
            onAddMember={handleAddMember}
            onDescriptionChange={handleDescriptionSave}
            onRemoveAttachment={(attId) => onRemoveAttachment?.(idea.id, attId)}
            onViewAttachment={(att) => window.open(att.url, "_blank")}
            onAddAttachment={(file) => onAddAttachment?.(idea.id, file)}
            onAddLabel={(tagId) => onAddLabel?.(idea.id, tagId)}
            onRemoveLabel={(tagId) => onRemoveLabel?.(idea.id, tagId)}
            onCreateTag={onCreateTag}
            availableTags={availableTags}
            boardId={boardId}
            canEdit={canEdit}
            columns={columns}
            teamMembers={teamMembers}
          />

          {/* Tabs Content */}
          <TaskModalTabs activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === "subtasks" && (
              <SubtasksTab
                subtasks={idea.subtasks || []}
                onToggle={(subtaskId) => onToggleSubtask?.(idea.id, subtaskId)}
                onAdd={(text) => onAddSubtask?.(idea.id, text)}
                onRemove={(subtaskId) => onRemoveSubtask?.(idea.id, subtaskId)}
                canEdit={canEdit}
              />
            )}
            {activeTab === "comments" && (
              <CommentsTab
                comments={comments || []}
                onAdd={handleAddComment}
                onUpdate={(commentId, text) =>
                  onUpdateComment?.(idea.id, commentId, text)
                }
                onDelete={(commentId) => onDeleteComment?.(idea.id, commentId)}
                canEdit={canEdit}
              />
            )}
            {activeTab === "activities" && (
              <ActivitiesTab activities={idea.activity || []} />
            )}
            {activeTab === "team" && (
              <TeamTab
                members={teamMembers || []}
                onRemove={(memberId) => console.log("Remove member", memberId)}
                onInvite={() => console.log("Invite member")}
                canEdit={canEdit}
              />
            )}
          </TaskModalTabs>
        </div>
      </div>
    </>
  );
};

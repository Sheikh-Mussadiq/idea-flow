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
  card,
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
  onAddComment,
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
  const [attachmentsWithUrls, setAttachmentsWithUrls] = useState([]);

  // Generate signed URLs for attachments when modal opens (lazy loading)
  useEffect(() => {
    if (!isOpen || !card) {
      setAttachmentsWithUrls([]);
      return;
    }

    const attachments = card.attachments || [];
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
              console.error(
                `Error generating URL for attachment ${att.id}:`,
                error
              );
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
          onUpdateCard(card.id, { attachments: allAttachments });
        }

        setAttachmentsWithUrls(allAttachments);
      } catch (error) {
        console.error("Error generating attachment URLs:", error);
        setAttachmentsWithUrls(attachments);
      }
    };

    generateUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, card?.id, card?.attachments]);

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
  }, [isOpen, card?.id]);

  if (!isOpen || !card) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleDescriptionSave = (value) => {
    setLocalDescription(value);
    onUpdateDescription?.(card.id, value);
  };

  const handleStatusChange = (column) => {
    onStatusChange?.(column.id);
    // Mock notification
    addNotification({
      userId: "current-user",
      message: `Status updated to '${column.title}' for '${card.title}'`,
      type: "activity",
      taskId: card.id,
      boardId: card.boardId,
    });
  };

  const handleAddMember = (member) => {
    onAssign?.(card.id, member);
    // Mock notification
    addNotification({
      userId: "current-user",
      message: `Assigned ${member.user?.full_name || member.user?.email} to '${
        card.title
      }'`,
      type: "assignment",
      taskId: card.id,
      boardId: card.boardId,
    });
  };

  const handleRemoveMember = (member) => {
    onAssign?.(card.id, member); // Toggle will handle removal
  };

  const handleTitleSave = (newTitle) => {
    onUpdateTitle?.(card.id, newTitle);
  };

  const handleDueDateChange = (date) => {
    onChangeDueDate?.(card.id, date);
    addNotification({
      userId: "current-user",
      message: `Due date changed to ${date} for '${card.title}'`,
      type: "due",
      taskId: card.id,
      boardId: card.boardId,
    });
  };

  const handleAddComment = (text) => {
    onAddComment?.(card.id, text);

    // Check for mentions
    if (text.includes("@")) {
      addNotification({
        userId: "current-user",
        message: `You were mentioned in a comment on '${card.title}'`,
        type: "mention",
        taskId: card.id,
        boardId: card.boardId,
      });
    } else {
      // Notify participants
      addNotification({
        userId: "current-user",
        message: `New comment on '${card.title}'`,
        type: "general",
        taskId: card.id,
        boardId: card.boardId,
      });
    }
  };

  // Map card data to sidebar props
  const assignees =
    card.assignees || (card.assignedTo ? [card.assignedTo] : []);

  // Use attachmentsWithUrls if available (has signed URLs), otherwise fallback to card.attachments
  const attachments = (
    attachmentsWithUrls.length > 0
      ? attachmentsWithUrls
      : card.attachments || []
  ).map((att) => ({
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
          title={card.title}
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
            status={card.kanbanStatus || "Backlog"}
            dueDate={card.dueDate}
            assignees={assignees}
            tags={card.labels || card.tags || []}
            description={localDescription}
            attachments={attachments}
            onStatusChange={handleStatusChange}
            onDueDateChange={handleDueDateChange}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onDescriptionChange={handleDescriptionSave}
            onRemoveAttachment={(attId) => onRemoveAttachment?.(card.id, attId)}
            onViewAttachment={(att) => window.open(att.url, "_blank")}
            onAddAttachment={(file) => onAddAttachment?.(card.id, file)}
            onAddLabel={(tagId) => onAddLabel?.(card.id, tagId)}
            onRemoveLabel={(tagId) => onRemoveLabel?.(card.id, tagId)}
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
                subtasks={card.subtasks || []}
                onToggle={(subtaskId) => onToggleSubtask?.(card.id, subtaskId)}
                onAdd={(text) => onAddSubtask?.(card.id, text)}
                onRemove={(subtaskId) => onRemoveSubtask?.(card.id, subtaskId)}
                canEdit={canEdit}
              />
            )}
            {activeTab === "comments" && (
              <CommentsTab
                comments={comments || []}
                onAdd={handleAddComment}
                onUpdate={(commentId, text) =>
                  onUpdateComment?.(card.id, commentId, text)
                }
                onDelete={(commentId) => onDeleteComment?.(card.id, commentId)}
                canEdit={canEdit}
              />
            )}
            {activeTab === "activities" && (
              <ActivitiesTab activities={card.activity || []} />
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

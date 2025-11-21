import { useEffect, useState } from "react";
import { TaskModalHeader } from "./TaskModal/TaskModalHeader";
import { TaskModalSidebar } from "./TaskModal/TaskModalSidebar";
import { TaskModalTabs } from "./TaskModal/TaskModalTabs";
import { SubtasksTab } from "./TaskModal/SubtasksTab";
import { CommentsTab } from "./TaskModal/CommentsTab";
import { ActivitiesTab } from "./TaskModal/ActivitiesTab";
import { TeamTab } from "./TaskModal/TeamTab";

export const TaskModal = ({
  isOpen,
  onClose,
  idea,
  teamMembers,
  onAssign,
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
  comments,
  onAddCommentToIdea,
  onDeleteComment,
  onUpdateComment,
  onArchiveTask,
  canEdit,
}) => {
  const [activeTab, setActiveTab] = useState("subtasks");
  const [isClosing, setIsClosing] = useState(false);
  const [localDescription, setLocalDescription] = useState("");

  useEffect(() => {
    if (idea) {
      setLocalDescription(idea.description || "");
      setActiveTab("subtasks");
    }
  }, [idea]);

  useEffect(() => {
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
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleDescriptionSave = (value) => {
    setLocalDescription(value);
    onUpdateDescription?.(idea.id, value);
  };

  const handleStatusChange = () => {
    // This would open a status picker - simplified for now
    console.log("Status change clicked");
  };

  const handleAddMember = () => {
    // This would open a member picker - using existing onAssign logic
    console.log("Add member clicked");
  };

  // Map idea data to sidebar props
  const assignees = idea.assignedTo ? [idea.assignedTo] : [];
  const tags = idea.labels || [];
  const attachments = (idea.attachments || []).map((att) => ({
    ...att,
    size: att.size || Math.floor(Math.random() * 500000), // Mock size if not available
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div
        className={`fixed top-4 right-4 bottom-4 z-50 w-full max-w-4xl bg-white shadow-2xl flex flex-col rounded-2xl border border-neutral-200 transition-transform duration-300 ease-out ${
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
        />

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Sidebar (now top content) */}
          <TaskModalSidebar
            status={idea.status || "In Progress"}
            dueDate={idea.dueDate}
            assignees={assignees}
            tags={tags}
            description={localDescription}
            attachments={attachments}
            onStatusChange={handleStatusChange}
            onDueDateChange={(date) => onChangeDueDate?.(idea.id, date)}
            onAddMember={handleAddMember}
            onDescriptionChange={handleDescriptionSave}
            onRemoveAttachment={(attId) => onRemoveAttachment?.(idea.id, attId)}
            onViewAttachment={(att) => window.open(att.url, "_blank")}
            canEdit={canEdit}
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
                onAdd={(text) => onAddCommentToIdea?.(idea.id, text)}
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

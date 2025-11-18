import { KanbanBoard } from "./KanbanBoard.jsx";

export const KanbanView = ({
  ideas,
  onOpenComments,
  onMoveCard,
  onViewInFlow,
  onAssign,
  onOpenTask,
  teamMembers,
  canEdit,
}) => {
  return (
    <div className="h-full w-full bg-neutral-100/40 pt-14">
      <KanbanBoard
        ideas={ideas}
        onOpenComments={onOpenComments}
        onMoveCard={onMoveCard}
        onViewInFlow={onViewInFlow}
        teamMembers={teamMembers}
        onAssign={onAssign}
        onOpenTask={onOpenTask}
        canEdit={canEdit}
      />
    </div>
  );
};

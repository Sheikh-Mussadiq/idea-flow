import { KanbanBoard } from "./KanbanBoard.jsx";

const teamMembers = [
  { id: "1", name: "Alex Morgan", avatar: "A" },
  { id: "2", name: "Maria Chen", avatar: "M" },
  { id: "3", name: "David Kim", avatar: "D" },
];

export const KanbanView = ({
  ideas,
  onOpenComments,
  onMoveCard,
  onViewInFlow,
  onAssign,
  onOpenTask,
}) => {
  return (
    <div className="h-full w-full bg-muted/40 pt-14">
      <KanbanBoard
        ideas={ideas}
        onOpenComments={onOpenComments}
        onMoveCard={onMoveCard}
        onViewInFlow={onViewInFlow}
        teamMembers={teamMembers}
        onAssign={onAssign}
        onOpenTask={onOpenTask}
      />
    </div>
  );
};

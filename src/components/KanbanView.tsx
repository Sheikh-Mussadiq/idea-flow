import { KanbanBoard, type KanbanStatus } from "@/components/KanbanBoard";
import type { Idea } from "@/components/FlowContent";

const teamMembers = [
  { id: "1", name: "Alex Morgan", avatar: "A" },
  { id: "2", name: "Maria Chen", avatar: "M" },
  { id: "3", name: "David Kim", avatar: "D" },
];

interface KanbanViewProps {
  ideas: Idea[];
  onOpenComments: (id: string) => void;
  onMoveCard: (id: string, status: KanbanStatus) => void;
  onViewInFlow: (id: string) => void;
  onAssign: (
    id: string,
    member: { id: string; name: string; avatar: string } | null
  ) => void;
  onOpenTask: (id: string) => void;
}

export const KanbanView = ({
  ideas,
  onOpenComments,
  onMoveCard,
  onViewInFlow,
  onAssign,
  onOpenTask,
}: KanbanViewProps) => {
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

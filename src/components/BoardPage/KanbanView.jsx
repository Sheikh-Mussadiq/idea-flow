import { KanbanBoard } from "./KanbanBoard.jsx";
import { SynthAIChat } from "./SynthAIChat.jsx";

export const KanbanView = ({
  ideas,
  columns,
  onOpenComments,
  onMoveCard,
  onViewInFlow,
  onAssign,
  onOpenTask,
  onAddTask,
  onReorderIdeas,
  teamMembers,
  canEdit,
}) => {
  return (
    <div className="h-full w-full bg-neutral-50 flex overflow-hidden">
      {/* Main Board Area */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          ideas={ideas}
          columns={columns}
          onOpenComments={onOpenComments}
          onMoveCard={onMoveCard}
          onViewInFlow={onViewInFlow}
          teamMembers={teamMembers}
          onAssign={onAssign}
          onOpenTask={onOpenTask}
          onAddTask={onAddTask}
          onReorderIdeas={onReorderIdeas}
          canEdit={canEdit}
        />
      </div>

      {/* Right Panel (AI Chat) */}
      {/* <SynthAIChat /> */}
    </div>
  );
};

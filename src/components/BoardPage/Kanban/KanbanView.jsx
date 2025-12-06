import { KanbanBoard } from "./KanbanBoard.jsx";
import { SynthAIChat } from "../Panels/SynthAIChat.jsx";

export const KanbanView = ({
  cards,
  columns,
  onOpenComments,
  onMoveCard,
  onViewInFlow,
  onAssign,
  onOpenTask,
  onAddCard,
  onReorderCards,
  teamMembers,
  canEdit,
}) => {
  return (
    <div className="h-full w-full bg-neutral-50 flex overflow-hidden">
      {/* Main Board Area */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          cards={cards}
          columns={columns}
          onOpenComments={onOpenComments}
          onMoveCard={onMoveCard}
          onViewInFlow={onViewInFlow}
          teamMembers={teamMembers}
          onAssign={onAssign}
          onOpenTask={onOpenTask}
          onAddCard={onAddCard}
          onReorderCards={onReorderCards}
          canEdit={canEdit}
        />
      </div>

      {/* Right Panel (AI Chat) */}
      {/* <SynthAIChat /> */}
    </div>
  );
};
